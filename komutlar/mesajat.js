const Discord = require('discord.js');
exports.run = (client, message, args) => {
  if (message.author.id != "693140554330144829") return message.reply('Bunu Sadece Sahibim Kullanabilir');
      
  if (!message.guild) {
  const ozelmesajuyari = new Discord.RichEmbed()
  .setColor(0xFF0000)
  .setTimestamp()
  .setAuthor(message.author.username, message.author.avatarURL)
  .addField('⚠ Uyarı ⚠', 'Bu  komutu özel mesajlarda kullanamazsın.');
  return message.author.sendEmbed(ozelmesajuyari); }
  let guild = message.guild;
  let reason = args.slice(1).join(' ');
  let user = message.mentions.users.first();
  if (reason.length < 1) return message.reply('Ne göndereceğim');
  if (message.mentions.users.size < 1) return message.reply('Kime mesaj atacağım?').catch(console.error);
  message.delete();
  message.reply('Mesajını Gönderdim.')
  message.delete();
  var embed = new Discord.MessageEmbed()
  .setColor('RED')
  .setTitle(`**Kurucumdan Bir Mesajın Var**`)
  .setTimestamp()
  .setDescription(reason);
  return user.send(embed);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['pm','öm'],
  permlevel: 4
};

exports.help = {
  name: 'dm',
  description: 'Bir kullanıcıya özelden mesaj atar.',
  usage: 'dm'
};