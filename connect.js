require("./modsv4/global")

const func = require("./modsv4/place")

async function startSesi() {

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const { state, saveCreds } = await useMultiFileAuthState(`./session`)
const { version, isLatest } = await fetchLatestBaileysVersion()

const connectionOptions = {
version,
keepAliveIntervalMs: 30000,
printQRInTerminal: true,
logger: pino({ level: "fatal" }),
auth: state,
browser: ["ModsV4`", "IOS", "4.1.0"],
}

const Mods = func.makeWASocket(connectionOptions)

store.bind(Mods.ev)

Mods.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
console.log(color(lastDisconnect.error, 'deeppink'))
if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
process.exit()
} else if (reason === DisconnectReason.badSession) {
console.log(color(`Bad Session File, Please Delete Session and Scan Again`))
process.exit()
} else if (reason === DisconnectReason.connectionClosed) {
console.log(color('[SYSTEM]', 'white'), color('Connection closed, reconnecting...', 'deeppink'))
process.exit()
} else if (reason === DisconnectReason.connectionLost) {
console.log(color('[SYSTEM]', 'white'), color('Connection lost, trying to reconnect', 'deeppink'))
process.exit()
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(color('Connection Replaced, Another New Session Opened, Please Close Current Session First'))
Mods.logout()
} else if (reason === DisconnectReason.loggedOut) {
console.log(color(`Device Logged Out, Please Scan Again And Run.`))
Mods.logout()
} else if (reason === DisconnectReason.restartRequired) {
console.log(color('Restart Required, Restarting...'))
await startSesi()
} else if (reason === DisconnectReason.timedOut) {
console.log(color('Connection TimedOut, Reconnecting...'))
startSesi()
}
} else if (connection === "connecting") {
start(`1`, `Connecting...`)
} else if (connection === "open") {
success(`1`, `Tersambung`)
if (autoJoin) {
Mods.groupAcceptInvite(codeInvite)
}
}
})

Mods.ev.on('messages.upsert', async (chatUpdate) => {
try {
m = chatUpdate.messages[0]
if (!m.message) return
m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
if (m.key && m.key.remoteJid === 'status@broadcast') return Mods.readMessages([m.key])
if (!Mods.public && !m.key.fromMe && chatUpdate.type === 'notify') return
if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
m = func.smsg(Mods, m, store)
require("./modsv4")(Mods, m, store)
} catch (err) {
console.log(err)
}
})

Mods.ev.on('group-participants.update', async (anu) => {
console.log(anu)
try {
let metadata = await Mods.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await Mods.profilePictureUrl(num, 'image')
} catch {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await Mods.profilePictureUrl(anu.id, 'image')
} catch {
ppgroup = 'https://i.ibb.co/s2KvYYf/20230524-060103.png'
}
let nameUser = await Mods.getName(num)
let membr = metadata.participants.length
if (anu.action == 'add') {
await welcome(`${nameUser}`, `${metadata.subject}`, `${ppgroup}`, `${membr}`, `${ppuser}`, `https://i.ibb.co/LgWsTJC/1685442424826.jpg`)
Mods.sendMessage(anu.id, { image: fs.readFileSync(`./modsv4/tmp/welcome1.png`), mentions: [num], caption: `✧━━━━━━[ *WELCOME* ]━━━━━━✧

┏––––––━━━━━━━━•
│⫹⫺ YT : ${nameUser}
┣━━━━━━━━┅┅┅
│( 👋 Hallo @${num.split('@')[0]} ⁩)
├[ *INTRO* ]—
│ *Nama:* 
│ *Umur:* 
│ *Gender:*
┗––––––━━┅┅┅

––––––┅┅ *DESCRIPTION* ┅┅––––––
${metadata.desc}` })
} else if (anu.action == 'remove') {
await goodbye(`${nameUser}`, `${metadata.subject}`, `${ppgroup}`, `${membr}`, `${ppuser}`, `https://i.ibb.co/LgWsTJC/1685442424826.jpg`)
Mods.sendMessage(anu.id, { image: fs.readFileSync(`./modsv4/tmp/goodbye1.png`), mentions: [num], caption: `✧━━━━━━[ *GOOD BYE* ]━━━━━━✧
Sayonara *@${num.split('@')[0]}* 👋

*G O O D B Y E*'` })
}
}
} catch (err) {
console.log(err)
}
})

Mods.ev.on('contacts.update', (update) => {
for (let contact of update) {
let id = Mods.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

Mods.public = true

Mods.ev.on('creds.update', saveCreds)
return Mods
}

startSesi()

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})