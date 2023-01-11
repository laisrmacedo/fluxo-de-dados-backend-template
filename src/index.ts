import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

app.get("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const result = accounts.find((account) => account.id === id) 
        if(!result){
            //404 é pra req nao encontrada
            res.status(404)
            throw new Error("Conta não encontrada. Verifique a 'id'.")
        }
        res.status(200).send(result)
    } catch (error:any) {
        console.log(error)
        //200 é o valor padrão 
        //se entrar aqui é um erro inesperado e deve-se passar o erro com o nº certo 
        if(res.statusCode === 200){
            res.status(500)
        }
        res.send(error.message)
    }
})

app.delete("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        if(id[0] !== "a"){
            res.status(400)
            throw new Error("'id' inválido. Deve iniciar com a letra 'a'")
        }
        const accountIndex = accounts.findIndex((account) => account.id === id)
        console.log(accountIndex)
        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
            res.status(200).send("Item deletado com sucesso")
        }else{
            res.status(404).send("'id' não encontrado")
        }
        
    } catch (error) {
        console.log(error)
        if(res.statusCode === 200){
            res.status(500)
        }
        res.send(error.message)
    }
})

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
    
        const newId = req.body.id //as string | undefined
        if(newId !== undefined){
            if(newId[0] !== "a"){
                res.status(400)
                throw new Error("'id' inválido. Deve iniciar com a letra 'a'")
            }
        }

        const newOwnerName = req.body.ownerName //as string | undefined
        if(newOwnerName !== undefined){
            if(newOwnerName.length < 2){
                res.status(400)
                throw new Error("'OwnerName' inválido. Deve ter no mínimo 2 caracteres")
            }
        }

        const newBalance = req.body.balance //as number | undefined
        if(newBalance !== undefined){
            if(typeof newBalance !== "number"){
                res.status(400)
                throw new Error("'Balance' deve ser um número")
            }
            if(newBalance < 0){
                res.status(400)
                throw new Error("'Balance' não pode ser um número negativo") 
            }
        }
        
        const newType = req.body.type //as ACCOUNT_TYPE | undefined

        if(newType !== undefined){
            if( newType !== ACCOUNT_TYPE.GOLD && 
                newType !== ACCOUNT_TYPE.PLATINUM && 
                newType !== ACCOUNT_TYPE.BLACK){
                    res.status(400)
                    throw new Error("'Type' dever ser Ouro, Platina ou Black")
            }
        }
    
        const account = accounts.find((account) => account.id === id) 
    
        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type
    
            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }
    
        res.status(200).send("Atualização realizada com sucesso")
        
    } catch (error) {
        console.log(error)
        if(res.statusCode === 200){
            res.status(500)
        }
        res.send(error.message)
    }
})