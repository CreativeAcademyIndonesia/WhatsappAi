const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require('qrcode-terminal')
const pino = require('pino');


async function connectToWhatsApp(){
    const auth = await useMultiFileAuthState("session")
    const socket = makeWASocket({
        printQRTerminal : true, 
        Browser : ["Windows", "Chrome", "11"], 
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
        console.log(messages[0].key.fromMe)
        if( !messages[0].key.fromMe ){
            query({"question": chat }).then((response) => {
                const { text, question, chatId, chatMessageId, sessionId } = response
                socket.sendMessage(fromNumberHp, { text: text })
            });
        }

    })
}

async function query(data) {
    const response = await fetch(
        "http://localhost:3000/api/v1/prediction/37cd82fa-b234-4420-98cd-b51fd52f3193",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

connectToWhatsApp()