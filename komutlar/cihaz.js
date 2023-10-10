const Discord = require('discord.js');
exports.run = async (client, message, args) => {
  if (message.author.id != "693140554330144829") return message.reply('Bunu Sadece Sahibim Yapabilir');


  let member;
  if (message.mentions.members.first()) {
    member = message.mentions.members.first();
  } else {
    member = message.guild.members.cache.get(args[0]) || message.member;
  }

  let baknedicm = {
    web: 'İnternet Tarayıcısı <:internettaraycs:1130900069034491956>',
    desktop: 'Bilgisayar (Uygulama) <a:discordclient:1130900834620809216>',
    mobile: 'Mobil <:telefon:1130899387753701456>'
  };

  let durum = member.user.presence.status.replace('dnd', 'Rahatsız etmeyin.').replace('idle', 'Boşta.').replace('online', 'Aktif.').replace('offline', 'Çevrimdışı.');
  let uyy;
  if (member.user.presence.status !== 'offline') {
    uyy = `Bağlandığı cihaz: ${baknedicm[Object.keys(member.user.presence.clientStatus)[0]]}`;
  } else {
    uyy = '';
  }

  const embed = new Discord.MessageEmbed()
    .setColor('#00ff00')
    .setAuthor(member.user.tag, member.user.displayAvatarURL())
    .setDescription(`Kullanıcının durumu: ${durum}${uyy} `)
    .setTimestamp();

  message.channel.send(embed);
  console.log("cihaz " + message.author.username + '#' + message.author.discriminator + " tarafından kullanıldı.");
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'cihaz'
};