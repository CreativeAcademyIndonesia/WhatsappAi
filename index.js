const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require('qrcode-terminal')

async function connectToWhatsApp(){
    const auth = await useMultiFileAuthState("session")
    const socket = makeWASocket({
        printQRTerminal : true, 
        Browser : ["Windows 11", "Chrome", "11"], 
        auth : auth.state, 
        logger: pino({ level: "silent" }),
    })

    socket.ev.on("creds.update", auth.saveCreds)
    socket.ev.on("connection.update", async({connection, qr}) =>{
        if(connection === "open"){
            console.log("Whatsapp Ready..!")
        }else if(connection === "close"){
            console.log("Whatsapp Close..!")
            connectToWhatsApp()
        }
        if(qr) {
            qrcode.generate(qr, {small: true});
        }
    })

    socket.ev.on("messages.upsert", async ({messages})=>{
        console.log(messages)
        const chat = messages[0].message?.extendedTextMessage?.text || messages[0].message?.conversation;
        const fromNumberHp = messages[0].key.remoteJid
    })
}

connectToWhatsApp()