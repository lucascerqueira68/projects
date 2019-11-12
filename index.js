const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const GoogleSpreadsheet = require('google-spreadsheet')
const Credentials = require('./bugtracker.json')
const {promisify} = require('util')
const sgMail = require('@sendgrid/mail')

//configuracoes
const docId= '1O5-NkZzwnZPdcPQu6HnyBELUTqyHbfEg3rMEnUAoGjg'
const worksheetIndex= 0
const SendGridKey = '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'

app.set ('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(bodyParser.urlencoded({extended: true}))


app.get('/', (Request, Response) => {
    Response.render('home')
})

app.post('/', async(request, Response)=>{
            try {
    const doc = new GoogleSpreadsheet(docId)
    await promisify(doc.useServiceAccountAuth)(Credentials)
    const info = await promisify(doc.getInfo)()
    const worksheet = info.worksheets[worksheetIndex]
    await promisify(worksheet.addRow)({ 
            name: request.body.name, 
            email:request.body.email, 
            insueType: request.body.insueType, 
            howToReproduce: request.body.howToReproduce, 
            expectedOutPut: request.body.expectedOutPut, 
            receiveOutPut: request.body.receiveOutPut,
            userAgent: request.body.userAgent,
            userDate: request.body.userDate,
            source: request.query.source || 'direct'
            })

            // se for CRITICO

            if (request.body.insueType === 'Critical'){
                sgMail.setApiKey(SendGridKey)
                const msg = {
                  to: 'lucascerqueira68@gmail.com',
                  from: 'lucascerqueira68@gmail.com',
                  subject: 'BUG CRITICO REPORTADO',
                  text: `
                  O usuário ${request.body.name} reportou um problema. 
                  `,
                  html: `O usuário ${request.body.name} reportou um problema`,
                }
                await sgMail.send(msg)
            }
            

                Response.render('sucess')
            } catch(err){
            Response.send('Erro ao enviar formulário')
            console.log(err)    
            }  
})


app.listen(3000, (err)=>{
    if(err)     {
    console.log('aconteceu um erro')
}else{
    console.log('bugtracker rodando na porta http://localhost:3000')}

})