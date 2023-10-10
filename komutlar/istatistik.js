const Discord = require("discord.js");
const moment = require("moment");
const os = require("os");
const si = require("systeminformation");
require("moment-duration-format");

exports.run = async (client, message, args) => {
  const seksizaman = moment
    .duration(client.uptime)
    .format(" D [gün], H [saat], m [dakika], s [saniye]");

  const gpuInfo = await si.graphics();
  const ip = await si.networkInterfaces();

  const istatistikler = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setTimestamp()
    .setFooter("wondexz", client.user.avatarURL())
    .addField("» **Botun Developerı <a:dev:1130889595962277908>**", "<@814782999198826526>")
    .addField(
      "» **Gecikme süreleri**",
      "Mesaj Gecikmesi: {ping1} ms \nBot Gecikmesi: {ping2} ms"
        .replace("{ping1}", new Date().getTime() - message.createdTimestamp)
        .replace("{ping2}", client.ws.ping),
      true
    )
    .addField(
      "» **Bellek kullanımı**",
      (process.memoryUsage().heapUsed / 1024 / 512).toFixed(2) + " MB",
      true
    )
    .addField("» **Çalışma süresi**", seksizaman, true)
    .addField(
      "» **Kullanıcılar**",
      client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
      true
    )
    .addField("» **Sunucular**", client.guilds.cache.size.toLocaleString(), true)
    .addField("» **Kanallar**", client.channels.cache.size.toLocaleString(), true)
    .addField("» **Discord.JS sürüm**", "v" + Discord.version, true)
    .addField("» **Node.JS sürüm**", `${process.version}`, true)
    .addField(
      "» **Müzik Çalınan Sunucu Sayısı**",
      client.voice.connections.size,
      true
    )
    .addField("» **İşlemci**", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``, true)
    .addField("» **Ekran Kartı**", `\`\`\`md\n${gpuInfo.controllers[0].model}\`\`\``, true)
    .addField("» **Bit**", `\`${os.arch()}\``, true)
    .addField("» **İşletim Sistemi**", `\`\`${os.platform()}\`\``, true)

  console.log("istatistik " + message.author.username + "#" + message.author.discriminator + " tarafından kullanıldı.");
  
  return message.channel.send(istatistikler);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["i"],
  permLevel: 0
};

exports.help = {
  name: "istatistik",
  description: "Botun istatistiklerini gösterir",
  usage: "istatistik"
};