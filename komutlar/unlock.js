const Discord = require('discord.js');
 
exports.run = (client, message, args) => {
if(!message.member.hasPermission('MANAGE_CHANNELS')) return;
let channel = message.mentions.channels.first() || message.channel;
let everyone = message.guild.roles.cache.find(a => a.name === '@everyone');

channel.updateOverwrite(everyone, { 'SEND_MESSAGES': null }, 'Unlocked by '+message.author.tag);
const authorAvatar = message.author.displayAvatarURL();

channel.send(new Discord.MessageEmbed()
.setDescription('<#'+channel.id+ `>,${message.author} tarafından kilidi açıldı.`));
console.log("unlock " + message.author.username + '#' + message.author.discriminator + " tarafından kullanıldı.")

 
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};
 
exports.help = {
  name: 'unlock'
};