require("./module")

global.owner = "6282210819939"
global.namabot = "Djamet"
global.namaCreator = "Djamet Botz"
global.autoJoin = true
global.antilink = false
global.versisc = '7.1.2'
global.codeInvite = "CswK4kvQD1u7SfSmsYfMHZ"
global.thumb = fs.readFileSync("./thumb.png")
global.audionya = fs.readFileSync("./modsv4/sound.mp3")
global.tekspushkon = ""
global.tekspushkonv2 = ""
global.packname = ""
global.author = "Sticker By Djamet Botz"
global.jumlah = "5"

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})