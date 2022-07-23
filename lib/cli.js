#!/usr/bin/env node

// cli的入口文件,必须要有这么一个特殊的文件头，用于指定代码文件的运行环境（hashbang注解）
// 如果是Linux或者macOS系统下的，还需要修改此文件的读写权限为755，
// 具体就是通过: chmod 755 cli.js实现修改
const path = require('path')
const fs = require('fs')
const https = require('https')
const ini = require('ini')
const inquirer = require('inquirer')
const colors = require('colors')
const { execSync } = require('child_process')
const cwd = process.cwd()
const projectName = cwd.slice(cwd.lastIndexOf('/') + 1).toLowerCase()
const { Octokit } = require('@octokit/core')
const { getGitConfig } = require('../utils')
console.log('You are trying to create a new github remote repostry...'.yellow)
console.log(
  'Please answer the questions bellow to complete your repostry base setting:'
    .blue
)

// 目标目录
// const destDir = process.cwd()

// 获取系统配置中的user
const gitConfig = getGitConfig()
let { name, token } = gitConfig.user
if (!token) {
  const cwdTokenConfigPath = path.join(process.cwd(), '.token.ini')
  if (fs.existsSync(cwdTokenConfigPath)) {
    const file = fs.readFileSync(cwdTokenConfigPath, 'utf8')
    const tokenConfig = ini.parse(file)
    token = tokenConfig.Github ? tokenConfig.Github.access_token : ''
  } else {
    console.log(
      'Github access token not found. you can config it in `%s` or the global `.gitconfig` file mentioned above'
        .red,
      cwdTokenConfigPath
    )
    process.exit(1)
  }
}

// 创建github api实例
const octokit = new Octokit({
  auth: token
})

/**
 * 检查给定的repoName是否已经存在同名仓库
 * 检查时需要做分页轮询，知道知道存在同名或者全部页码都检查完了才返回结果
 * @param {*} repoName
 * @param {*} page
 * @param {*} per_page
 * @returns
 */
const checkRepoNameUsable = (repoName, page = 1, per_page = 100) => {
  // 逐页获取当前用户的仓库，以便检查要创建的仓库是否已存在（存在重名仓库）
  return octokit
    .request('GET /user/repos', { per_page: per_page, page: page })
    .then(({ data: repos }) => {
      // 检查当前用户中是否存在同名仓库
      const sameNameRepoExists = repos.some(repo => {
        return repo.name === repoName
      })
      if (sameNameRepoExists) {
        return sameNameRepoExists
      } else if (per_page > repos.length) {
        return sameNameRepoExists
      } else {
        page++
        return checkRepoNameUsable(repoName, page)
      }
    })
}
/**
 *
 *  1、通过命令行交互询问用户预设的问题
 *	  使用inquirer模块实现命令行交互
 *	  yarn add inquirer
 *  2、根据用户的回答结果创建远程代码仓库
 */
inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Please input your project name: ',
      default: () => projectName,
      validate: function (input, answers) {
        // Declare function as asynchronous, and save the done callback
        const done = this.async()
        checkRepoNameUsable(input, 1)
          .then(sameNameRepoExists => {
            return sameNameRepoExists
              ? done(`Repostory name ${input} already exists`)
              : done(null, true)
          })
          .catch(err => {
            done(
              `Error catched when checking if the name ${input} already exists, please read try enter.`
            )
          })
      }
    },
    {
      type: 'confirm',
      name: 'private',
      message: 'Set your project private? ',
      default: false
    }
  ])
  .then(async answers => {
    // 根据用户的回答结果生成文件及其目录结构
    console.log('answers', answers)
    console.log('Set Repo name to: %s', answers.name.green)
    try {
      // 根据用户回答，构建仓库创建请求的配置options body
      // const postData = answers
      const postData = {
        name: answers.name,
        private: answers.private
      }
      const { data: repo } = await octokit.request('POST /user/repos', postData)

      console.log(`Remote repository is created with ssh_url: ${repo.ssh_url}`)
      // 将文件创建的仓库名及地址append到README.md文件头部
      //   echo "# ${repo_name}" >> README.md
      const content = `# ${repo.name}

Project Url: [${repo.url}](${repo.url})

`
      const readmePath = path.join(process.cwd(), 'README.md')
      if (fs.existsSync(readmePath)) {
        let mdfile = fs.readFileSync(readmePath, 'utf8')
        mdfile = `${content}${mdfile}`
        fs.writeFileSync(readmePath, mdfile)
      } else {
        try {
          fs.writeFileSync(readmePath, content)
          console.log(`${readmePath.green} created`)
        } catch (error) {
          throw error
        }
      }
      try {
        execSync('git init')
        execSync(`git remote add origin ${repo.ssh_url}`)
      } catch (error) {
        if (
          error.message &&
          error.message.includes('remote origin already exists.')
        ) {
          console.warn(
            `You can check it with the command:\n %s \n Or if that isn't what you need, try to run command:\n %s `,
            'git config --get remote.origin.url'.blue,
            `git remote remove origin && git remote add origin ${repo.ssh_url}`
              .blue
          )
        }
      }
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  })
