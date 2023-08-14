require("./module")

global.owner = "6281223720214"
global.namabot = "AkmalMods"
global.namaCreator = "AkmalMods"
global.autoJoin = false
global.antilink = false
global.versisc = '7.1.2'
global.codeInvite = "CswK4kvQD1u7SfSmsYfMHZ"
global.thumb = fs.readFileSync("./thumb.png")
global.audionya = fs.readFileSync("./modsv4/sound.mp3")
global.tekspushkon = ""
global.tekspushkonv2 = ""
global.packname = ""
global.author = "Sticker By AkmalMods"
global.jumlah = "5"

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})