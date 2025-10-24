//Skapa ny kanal (VG), bara för inloggad användare
//Ta bort kanal (VG), bara den som skapat kanalen
//Öppna kanaler: läsa och skicka meddelanden, för både gäst och inloggad
//Låsta kanaler: läsa och skicka meddelanden, för inloggad användare
//se alla kanaler, gäst och inloggad användare
import express, { type Router} from 'express'

const router: Router = express.Router()

export default router

