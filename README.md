# githubremotecreate

Project Url: [https://api.github.com/repos/denghuiquan/githubremotecreate](https://api.github.com/repos/denghuiquan/githubremotecreate)

# githubremotecreate-cli

Project Url: [https://api.github.com/repos/denghuiquan/githubremotecreate-cli](https://api.github.com/repos/denghuiquan/githubremotecreate-cli)

目录
- 1. **步骤**
- 2. **运行结果对比**
- 3. **一些问题**
- 4. **补充一些git命令**
  - 4.1 新建一个文件，并写入
  - 4.2 添加到暂存区
  - 4.3 提交到本地仓库
  - 4.2 提交到远程仓库

> **背景**：在使用github时，发现若是在本地终端要创建github仓库，每次都要进入到 github主页，或者使用github cli很不方便。
话不多说，直接开始。


1. 步骤
    环境：
   - 我的github用户名：denghuiquan
   - github token：网上有很多教程，不细讲。可以参考此链接：[Creating a personal access token](https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

系统配置的`~/.gitconfig` 配置`name` 和 `token`

```ini
[user]
	name = denghuiquan
	email = 980352129@qq.com
	token = ghp_E**********************p4v
```
你只需要把name、token 换成你的github用户名和对应的access—token（注意共有两处）就可以了。

或者把token配置到项目根目录下的： `.token.ini`
```
[Github]
access_token = ghp_E**********************p4v
```
如果采用这种局部配置的方式，为避免用户access-token泄露，记得在.gitignore文件中添加一行内容为`.token.ini`，用于忽律该文件，不把它传到git仓库中。

准备工作做好后，就可以开始了。

好啦，现在就可以愉快地一键部署github仓库了。

2. 运行结果对比
    运行githubremotecreate-cli前提示确保远端有仓库

    我们打开终端，创建新的文件夹后开始执行githubremotecreate-cli命令
    按照提示完成配置过后，就会创建出相应的远端仓库，并尝试添加到当前目录的git config中作为remote origin url 

    运行github-create后

    我们先看看本地，创建了一个以该目录命名的repository，如果当前目录不存在README.md文件则创建，若存在则把项目名跟远端仓库地址记录到其中。

    接下来我们进入到github网页中查看，刷新可以看到多了一个当前创建的仓库

1. 好了，本教程到这里就结束了。

    现在就可以愉快地在终端一键部署github repository了😝

4. 补充一些git命令
- 4.1 新建一个文件，并写入
    touch hello.txt
    echo "hello world\!" >> hello.txt
- 4.2 添加到暂存区
    git add hello.txt
- 4.3 提交到本地仓库
    git commit -m "add hello.txt"
- 4.2 提交到远程仓库
    git push origin master
