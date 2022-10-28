const app = require('express')()
const { Octokit } = require("@octokit/rest")
const { Novu } = require('@novu/node')
const fs = require('fs')
const path = require('path')
require('dotenv').config()


const handlerFunction = async (req, res) => {

    const { send } = req.query
    const octokit = new Octokit()

    // const query = "is:open is:issue label:hacktoberfest"

    const reponse = await octokit.request("GET /repos/dscvitc/dscvitchennai/issues") //{query} to get more specific data
    const issue = reponse.data

    if (send) {
        const novu = new Novu(process.env.NOVU_API_KEY)
        const files = fs.readdirSync(path.resolve("../data"))
        const users = files.map((file) => ({
            ...JSON.parse(fs.readFileSync(path.resolve("../data", file), "utf-8")),
            file,
        }))
        users.forEach((user) => {
            novu.trigger('issues-in-DSC', {
                to: {
                    subscriberId: user.id,
                    email: user.email,
                },
                payload: {
                    name: user.name,
                    title: issue.title,
                    author: issue.author,
                    url: issue.url,
                }
            })
        })
        console.log("Sent")
        res.status(200).json(users)
    }
}

app.use('/get', handlerFunction)

app.listen('5000', () => {
    console.log("Server is running on port 5000")
})