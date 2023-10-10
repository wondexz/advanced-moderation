const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  // BAN_MEMBERS yetkisine sahip olup olmadığını kontrol et
  if (!message.member.hasPermission('BAN_MEMBERS')) {
    const yetkiyok = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setDescription('<a:carpi:1133820846553714709> Bu komutu kullanma yetkiniz yok.')
    return message.reply(yetkiyok);
  }

  const userID = args[0];
  const kullaniciid = new Discord.MessageEmbed()
  .setColor('RANDOM')
  .setDescription('Lütfen bir kullanıcı IDsi belirtin.')
  if (!userID) return message.reply(kullaniciid);

  try {
    const bannedUser = await client.users.fetch(userID);
    const gecerlikullanici = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setDescription('Geçerli bir kullanıcı IDsi girin.')
    if (!bannedUser) return message.reply(gecerlikullanici);

    await message.guild.members.unban(userID);

    const unbanEmbed = new Discord.MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Kullanıcı Yasağı Kaldırıldı')
      .addField('Yasağı Kaldıran', message.author.tag, true)
      .addField('Kullanıcı', bannedUser.tag, true)
      .setFooter('wondexz tarafından geliştirildi.')
      .setTimestamp();

    message.channel.send(unbanEmbed);
  } catch (error) {
    console.error(error);
    const embeed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Hata')
    .setDescription('Bu kullanıcı yasaklı değil!')
    .setFooter('wondexz tarafından geliştirildi.')
    message.channel.send(embeed);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'unban'
};
