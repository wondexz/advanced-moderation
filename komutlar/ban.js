const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  // BAN_MEMBERS yetkisine sahip olup olmadığını kontrol et
  if (!message.member.hasPermission('BAN_MEMBERS')) {

    return message.reply('Bu komutu kullanma yetkiniz yok.');
  }
  const userID = args[0];
  if (!userID) return message.reply('Lütfen bir kullanıcı IDsi belirtin.');


  const reason = args.slice(1).join(" ");

  try {
    const user = await client.users.fetch(userID);

    await message.guild.members.ban(userID, { reason: reason });

    const banEmbed = new Discord.MessageEmbed()
      .setColor('RANDOM') 
      .setTitle('Kullanıcı Başarıyla Banlandı')
      .setDescription(`Banlanan Kullanıcı: ${user} (${user.id}) <a:ban:1130887158702555186>`)
      .addField('Sebep', reason || 'Belirtilmedi')
      .setFooter('wondexz tarafından geliştirildi.')
      .setTimestamp();

    message.channel.send(banEmbed);
  } catch (error) {
    console.error(error);
    message.channel.send('Bir hata oluştu, kullanıcıyı banlayamadım.');
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'ban'
};
