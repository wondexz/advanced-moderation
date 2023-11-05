const Discord = require('discord.js');
const client = new Discord.Client({ disableMentions: 'everyone' });
const ayarlar = require('./ayarlar.json');
const fs = require('fs');
const moment = require('moment');
require('./util/eventLoader')(client);

var prefix = ayarlar.prefix;
var token = ayarlar.token

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


require('dotenv').config();

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
//                                                                             ban
client.on('guildBanAdd', async (guild, user) => {
  const banLogChannel = guild.channels.cache.get(ayarlar.ban_log_id);
  if (!banLogChannel) return;


  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
  const logEntry = auditLogs.entries.first();

  if (!logEntry) return;


  const bannedUserTag = user.tag;
  const bannedUserID = user.id;


  const executorTag = logEntry.executor.tag;
  const executorID = logEntry.executor.id;


  const banReason = logEntry.reason || "Sebep belirtilmemiş.";
  const embed = new Discord.MessageEmbed()
  .setTitle(`${bannedUserTag} Adlı kişi sunucudan yasaklandı.`)
  .setDescription(`<:soruisareti:1160494370114519050> Yasaklama Sebebi: ${banReason}
  <:d_:1160494368151572510> Yasaklanan Kişi: ${bannedUserID}
  <a:ban:1130887158702555186> Yasaklayan Kişi: ${executorTag} (${executorID})`)
  .setColor('GREEN')
  .setTimestamp()
  banLogChannel.send(embed);
});
//                                                                                  ban
//                                                                                 unban
client.on('guildBanRemove', async (guild, user) => {
  const banLogChannel = guild.channels.cache.get(ayarlar.ban_log_id);
  if (!banLogChannel) return;


  const unbannedUserTag = user.tag;
  const unbannedUserID = user.id;


  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' });
  const logEntry = auditLogs.entries.first();

  if (!logEntry) return;


  const executorTag = logEntry.executor.tag;
  const executorID = logEntry.executor.id;
  const embed = new Discord.MessageEmbed()
  .setTitle(`${unbannedUserTag} Adlı kişinin yasağı kaldırıldı.`)
  .addField(`Yasağı Kaldıran`,`${executorTag} (${executorID})`)
  .setColor('GREEN')
  .setTimestamp()
  banLogChannel.send(embed);
});
//                                                                                 unban 


client.on('channelCreate', async (channel) => {
  const logChannelId = ayarlar.kanal_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel && channel.guild.me.hasPermission('MANAGE_CHANNELS')) {
      const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' });
      const logEntry = auditLogs.entries.first();

      if (logEntry) {
          const createdBy = logEntry.executor;
          const embed = new Discord.MessageEmbed()
              .setTitle('Yeni Kanal Oluşturuldu')
              .addField('Kanal Adı', channel.name)
              .addField('Kanal Türü', channel.type)
              .addField('Oluşturan', createdBy.tag)
              .setColor('#00FF00')
              .setTimestamp();

          logChannel.send(embed);
      }
  } else {
      console.log('Log kanalı bulunamadı veya MANAGE_CHANNELS yetkisi yok.');
  }
});


client.on('channelUpdate', async (oldChannel, newChannel) => {
  const logChannelId = ayarlar.kanal_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
      if (oldChannel.name !== newChannel.name) {

          const auditLogs = await newChannel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' });
          const logEntry = auditLogs.entries.first();
          const changedBy = logEntry ? logEntry.executor.tag : 'Bilinmiyor';

          const embed = new Discord.MessageEmbed()
              .setTitle('Bir Kanalın İsmi Değiştirildi')
              .addField('Kanal Adı (Eski)', oldChannel.name, true)
              .addField('Kanal Adı (Yeni)', newChannel.name, true)
              .addField('İsmi Değiştiren Yetkili', changedBy, true)
              .setColor('#FFA500')
              .setTimestamp();

          logChannel.send(embed);
      }
  } else {
      console.log('Log kanalı bulunamadı.');
  }
});

client.on('channelDelete', async (channel) => {
  const logChannelId = ayarlar.kanal_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel && channel.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
      const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' });
      const logEntry = auditLogs.entries.first();

      if (logEntry) {
          const deletedBy = logEntry.executor;
          const embed = new Discord.MessageEmbed()
              .setTitle('Bir Kanal Silindi')
              .addField('Kanal Adı', channel.name)
              .addField('Kanal Türü', channel.type)
              .addField('Silen Kullanıcı', deletedBy.tag)
              .setColor('#FF0000')
              .setTimestamp();

          logChannel.send(embed);
      }
  } else {
      console.log('Log kanalı bulunamadı veya VIEW_AUDIT_LOG yetkisi yok.');
  }
});

client.on('roleCreate', (role) => {
  const logChannelId = ayarlar.rol_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
      const embed = new Discord.MessageEmbed()
          .setTitle('Yeni Rol Oluşturuldu')
          .addField('Rol Adı', role.name)
          .addField('Rol ID', role.id)
          .setColor('#00FF00')
          .setTimestamp();

      logChannel.send(embed);
  } else {
      console.log('Log kanalı bulunamadı.');
  }
});

client.on('roleDelete', (role) => {
  const logChannelId = ayarlar.rol_log_id; 
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
      const permissions = role.permissions.toArray().map(permission => `\`${permission}\``).join(', ');

      const embed = new Discord.MessageEmbed()
          .setTitle('Bir Rol Silindi')
          .addField('Silinen Rol Adı', role.name)
          .addField('Silinen Rol ID', role.id)
          .addField('Silinen Rol Yetkileri', permissions || 'Yetkiler bulunamadı.')
          .setColor('#FF0000')
          .setTimestamp();

      logChannel.send(embed);
  } else {
      console.log('Log kanalı bulunamadı.');
  }
});

client.on('roleUpdate', (oldRole, newRole) => {
  const logChannelId = ayarlar.rol_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
      if (oldRole.name !== newRole.name) {
          // Rol ismi değişti
          const embedName = new Discord.MessageEmbed()
              .setTitle('Bir Rolün İsmi Değiştirildi')
              .addField('Eski İsim', oldRole.name)
              .addField('Yeni İsim', newRole.name)
              .setColor('#FFA500')
              .setTimestamp();

          logChannel.send(embedName);
      }

      const permissionsAdded = newRole.permissions.toArray().filter(permission => !oldRole.permissions.has(permission));
      const permissionsRemoved = oldRole.permissions.toArray().filter(permission => !newRole.permissions.has(permission));

      if (permissionsAdded.length > 0 || permissionsRemoved.length > 0) {
          // Yetkiler değişti
          const embedPermissions = new Discord.MessageEmbed()
              .setTitle('Bir Rolün Yetkileri Değiştirildi')
              .addField('Rol Adı', newRole.name)
              .addField('Rol ID', newRole.id)
              .addField('Eklenen Yetkiler', permissionsAdded.join(', ') || 'Yok')
              .addField('Kaldırılan Yetkiler', permissionsRemoved.join(', ') || 'Yok')
              .setColor('#FFA500')
              .setTimestamp();

          logChannel.send(embedPermissions);
      }
  } else {
      console.log('Log kanalı bulunamadı.');
  }
});


client.on('message', async message => {
  if (message.channel.type === 'dm' && !message.author.bot) {


    const ownerID = ayarlar.sahip;

    const owner = await client.users.fetch(ownerID);
    if (owner) {



      owner.send(`Kullanıcı: ${message.author.tag} (${message.author.id}) bana bir mesaj gönderdi:\n${message.content}`)
        .then(() => console.log('DM kurucusuna iletilmiştir.'))
        .catch(err => console.error('DM kurucusuna iletilirken hata oluştu:', err));
    } else {
      console.error('Kurucu kullanıcı bulunamadı.');
    }
  }
});

//                                                               uyarı-ver
client.on('message', message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'uyarı-ver') {

      const requiredRoleId = ayarlar.uyarı_yetkilisi_rolü_id;
      

      if (!message.member.roles.cache.has(requiredRoleId)) {
          return message.reply('Bu komutu kullanma izniniz yok.');
      }

      const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const reason = args.slice(1, -1).join(' ');
      const warningLevel = parseInt(args.slice(-1)[0]);

      if (!targetUser || !reason || isNaN(warningLevel) || warningLevel < 1 || warningLevel > 3) {
          return message.reply('Kullanım: `!uyarı-ver @kullanıcı / yada kullanıcı ID <sebep> <kaç-uyarı 1-2-3>`');
      }


      const logChannelId = ayarlar.uyarı_log_id;
      const logChannel = message.guild.channels.cache.get(logChannelId);


      const warningEmbed = new Discord.MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Kullanıcıya Uyarı Verildi')
          .addField('Uyarı veren', message.author)
          .addField('Uyarı alan', targetUser)
          .addField('Uyarı Sayısı', warningLevel)
          .addField('Sebep', reason)
          .setFooter('wondexz tarafından geliştirildi.')
          .setTimestamp();


      logChannel.send(warningEmbed);


      if (warningLevel === 1) {
          targetUser.roles.add(ayarlar.uyarı1_role_id).catch(console.error);
      } else if (warningLevel === 2) {
          targetUser.roles.add(ayarlar.uyarı2_role_id).catch(console.error);
      } else if (warningLevel === 3) {
          targetUser.roles.add(ayarlar.uyarı3_role_id).catch(console.error);
      }
      const embed = new Discord.MessageEmbed()
      .setTitle('Uyarı başarıyla verildi!')
      .addField('Uyarı verilen',targetUser)
      .addField('Kaç uyarı verildi',warningLevel)
      .addField('Uyarı sebebi',reason)
      message.reply(embed);
  }
});//                                                                               uyarı-ver
//                                                                                  uyarı-al
client.on('message', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'uyarı-al') {

      const requiredRoleId = ayarlar.uyarı_yetkilisi_rolü_id;


      if (!message.member.roles.cache.has(requiredRoleId)) {
          return message.reply('Bu komutu kullanma izniniz yok.');
      }

      const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const warningMessageId = args[1];

      if (!targetUser || !warningMessageId) {
          return message.reply('Kullanım: `!uyarı-al @kullanıcı / kullanıcı ID <uyarı mesajının IDsi>`');
      }

      // Uyarıları kanaldan sil
      const warningsChannel = message.guild.channels.cache.find(channel => channel.name === ayarlar.uyarı_kanalı_ismi); // Uyarılar kanalının adı 'uyarılar' olarak varsayıldı
      if (warningsChannel) {
          const warningMessage = await warningsChannel.messages.fetch(warningMessageId).catch(console.error);
          if (warningMessage) {
              warningMessage.delete().catch(console.error);
          }
      }


      const logChannelId = ayarlar.uyarı_log_id;
      const logChannel = message.guild.channels.cache.get(logChannelId);
      const reason = `Kullanıcıya verilen uyarılar alındı.`;

      const logEmbed = new Discord.MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Kullanıcının Uyarıları Alındı')
          .addField('Uyarı Alan Kullanıcı', targetUser)
          .addField('Uyarıları Silen Yetkili', message.author)
          .addField('Silinen Uyarı Mesajının IDsi', warningMessageId)
          .addField('Sebep', reason)
          .setFooter('wondexz tarafından geliştirildi.')
          .setTimestamp();

      logChannel.send(logEmbed);

      // Kullanıcının uyarı rolünü al
      let roleId = '';
      if (targetUser.roles.cache.has(ayarlar.uyarı1_role_id)) {
          roleId = ayarlar.uyarı1_role_id;
      } else if (targetUser.roles.cache.has(ayarlar.uyarı2_role_id)) {
          roleId = ayarlar.uyarı2_role_id;
      } else if (targetUser.roles.cache.has(ayarlar.uyarı3_role_id)) {
          roleId = ayarlar.uyarı3_role_id;
      }

      if (roleId) {
          targetUser.roles.remove(roleId).catch(console.error);
      }

      message.reply(`Başarıyla ${targetUser} kullanıcısının uyarısı alındı, uyarı mesajı silindi ve uyarı log kanalına bildirildi.`);
  }
});

//                                                                            uyarı-al
//                                                                           uyarı-azalt

client.on('message', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'uyarı-azalt') {
      // Komutu kullanabilmesi için gereken rol ID'si
      const requiredRoleId = ayarlar.uyarı_yetkilisi_rolü_id;

      // Komutu kullanan kişinin belirli role sahip olup olmadığını kontrol et
      if (!message.member.roles.cache.has(requiredRoleId)) {
          return message.reply('Bu komutu kullanma izniniz yok.');
      }

      const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const warningMessageId = args[1];

      if (!targetUser || !warningMessageId) {
          return message.reply('Kullanım: `!uyarı-azalt <uyarısı azaltılacak @kullanıcı / kullanıcı ID> <mesaj ID>`');
      }

      // Uyarı log kanalına mesaj gönder
      const logChannelId = uyarı_log_id; // Uyarı log kanalının ID'si
      const logChannel = message.guild.channels.cache.get(logChannelId);

      const logEmbed = new Discord.MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Uyarı Azaltıldı')
          .addField('Uyarısı Azaltılan Kullanıcı', targetUser)
          .addField('Azaltan Yetkili', message.author)
          .addField('Uyarı Mesajının IDsi', warningMessageId)
          .setFooter('wondexz tarafından geliştirildi.')
          .setTimestamp();

      logChannel.send(logEmbed);

 

      

      const roleToRemove = ayarlar.uyarı2_role_id;
      const roleToAdd = ayarlar.uyarı1_role_id;
      
      if (targetUser.roles.cache.has(roleToRemove)) {
          targetUser.roles.remove(roleToRemove).catch(console.error);
      }
      
      targetUser.roles.add(roleToAdd).catch(console.error);

      message.reply(`Başarıyla ${targetUser} kullanıcısının uyarısı azaltıldı, rolleri güncellendi ve uyarı log kanalına bildirildi.`);
  }
});

//                                                                              uyarı-azalt
require('dotenv').config();

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

const logChannelId = ayarlar.guard_log

client.on('channelDelete', async (channel) => {
  if (channel.type === 'text') {
    const guild = channel.guild;
    const roleId = ayarlar.guard_role; 

    const role = guild.roles.cache.get(roleId);
    if (role) {
      const auditLogs = await guild.fetchAuditLogs({ type: 'CHANNEL_DELETE', limit: 1 });
      const channelDeletion = auditLogs.entries.first();

      if (channelDeletion) {
        const deleter = channelDeletion.executor;

        if (deleter.id !== client.user.id && !role.members.has(deleter.id)) {
          await guild.members.ban(deleter, { reason: 'Kanal silme' });

          const logChannel = client.channels.cache.get(logChannelId);
          if (logChannel && logChannel.type === 'text') {
            const logEmbed = new Discord.MessageEmbed()
              .setColor('#ff0000')
              .setTitle('İzinsiz Metin Kanalı Silindi')
              .addField('Silinen Kanal', channel.name)
              .addField('Banlanan Kullanıcı', deleter.tag)
              .addField('Sebep', 'Kanal silme')
              .setFooter('Silinen kanal yeniden oluşturuldu ve kanalı silen kişi cezalandırıldı.')
              .setTimestamp();

            logChannel.send(logEmbed);
          }
          
          // Silinen kanalı yeniden oluştur
          guild.channels.create(channel.name, {
            type: 'text',
            parent: channel.parent,
            permissionOverwrites: channel.permissionOverwrites,
          });
        }
      }
    }
  }
});



client.on('channelDelete', async (channel) => {
  if (channel.type === 'voice') {
    const guild = channel.guild;
    const roleId = ayarlar.guard_role;

    const role = guild.roles.cache.get(roleId);
    if (role) {
      const auditLogs = await guild.fetchAuditLogs({ type: 'CHANNEL_DELETE', limit: 1 });
      const channelDeletion = auditLogs.entries.first();

      if (channelDeletion) {
        const deleter = channelDeletion.executor;

        if (deleter.id !== client.user.id && !role.members.has(deleter.id)) {
          await guild.members.ban(deleter, { reason: 'Kanal silme' });

          const logChannel = client.channels.cache.get(logChannelId);
          if (logChannel && logChannel.type === 'text') {
            const logEmbed = new Discord.MessageEmbed()
              .setColor('#ff0000')
              .setTitle('İzinsiz Ses Kanalı Silindi')
              .addField('Silinen Kanal', channel.name)
              .addField('Banlanan Kullanıcı', deleter.tag)
              .addField('Sebep', 'Kanal silme')
              .setFooter('Silinen kanal yeniden oluşturuldu ve kanalı silen kişi cezalandırıldı.')
              .setTimestamp();

            logChannel.send(logEmbed);
          }
          

          guild.channels.create(channel.name, {
            type: 'voice',
            parent: channel.parent,
            permissionOverwrites: channel.permissionOverwrites,
          });
        }
      }
    }
  }
});

client.on('channelCreate', async (channel) => {
  if (channel.type === 'text') {
    const guild = channel.guild;
    const roleId = ayarlar.guard_role; 

    const role = guild.roles.cache.get(roleId);
    if (role) {
      const auditLogs = await guild.fetchAuditLogs({ type: 'CHANNEL_CREATE', limit: 1 });
      const channelCreation = auditLogs.entries.first();

      if (channelCreation) {
        const creator = channelCreation.executor;

        if (creator.id !== client.user.id && !role.members.has(creator.id)) {
          await guild.members.ban(creator, { reason: 'Kanal oluşturma' });

          const logChannel = client.channels.cache.get(logChannelId);
          if (logChannel && logChannel.type === 'text') {
            const logEmbed = new Discord.MessageEmbed()
              .setColor('#ff0000')
              .setTitle('İzinsiz Metin Kanalı Oluşturuldu!')
              .addField('Oluşturulan Kanal', channel.name)
              .addField('Banlanan Kullanıcı', creator.tag)
              .addField('Sebep', 'Kanal oluşturma')
              .setFooter('Kanal silindi ve oluşturan kişi cezalandırıldı.')
              .setTimestamp();

            logChannel.send(logEmbed);
          }

          // Kanalı silme kısmı
          try {
            await channel.delete({ reason: 'İzinsiz metin kanalı oluşturma.' });
          } catch (error) {
            console.error('Kanal silinirken bir hata oluştu:', error);
          }
        }
      }
    }
  }
});

client.on('channelCreate', async (channel) => {
  if (channel.type === 'voice') {
    const guild = channel.guild;
    const roleId = ayarlar.guard_role;

    const role = guild.roles.cache.get(roleId);
    if (role) {
      const auditLogs = await guild.fetchAuditLogs({ type: 'CHANNEL_CREATE', limit: 1 });
      const channelCreation = auditLogs.entries.first();

      if (channelCreation) {
        const creator = channelCreation.executor;

        if (creator.id !== client.user.id && !role.members.has(creator.id)) {
          await guild.members.ban(creator, { reason: 'İzinsiz ses kanalına oluşturma.' });

          const logChannel = client.channels.cache.get(logChannelId);
          if (logChannel && logChannel.type === 'text') {
            const logEmbed = new Discord.MessageEmbed()
              .setColor('#ff0000')
              .setTitle('İzinsiz Ses Kanalı Oluşturuldu!')
              .addField('Oluşturulan Kanal', channel.name)
              .addField('Banlanan Kullanıcı', creator.tag)
              .addField('Sebep', 'Kanal oluşturma')
              .setThumbnail('https://cdn.discordapp.com/avatars/566295997165338659/a7226d9da5feaf6473af6404c33dbc8c.webp?size=1024')
              .setFooter('Kanal silindi ve oluşturan kişi cezalandırıldı.')
              .setTimestamp();

            logChannel.send(logEmbed);
          }


          try {
            await channel.delete({ reason: 'İzinsiz kanal oluşturma' });
          } catch (error) {
            console.error('Kanal silinirken bir hata oluştu:', error);
          }
        }
      }
    }
  }
});

const reklamKelimeleri = ['.com', '.net', '.gg' , '.org' , '.com.tr' , '.tk' , 'https' , '.tv' , 'http' , '.cn' , '.ru' , '.co' , '.org.tr' , '.net.tr'];
const logKanalID = ayarlar.reklam_log;

client.on('message', async (message) => {
  if (!message.author.bot) {
    const content = message.content.toLowerCase();
    const reklamKelimesi = reklamKelimeleri.find((kelime) => content.includes(kelime));

    if (reklamKelimesi) {

      if (message.guild.member(message.author).permissions.has('ADMINISTRATOR')) {
        return;
      }

      message.delete();

 
      try {
        await message.author.send('**Reklam Yapma Yoksa Banlanacaksın!**');
      } catch (error) {
        console.error('DM gönderilemedi:', error);
      }


      const logKanal = client.channels.cache.get(logKanalID);
      if (logKanal) {
        const logEmbed = new Discord.MessageEmbed()
          .setColor('RANDOM')
          .setTitle('**Bir Kullanıcı Reklam Yaptı!**')
          .setDescription(`${message.author} tarafından reklam içeren bir mesaj gönderildi.`)
          .addField('Mesaj İçeriği', message.content)
          .setThumbnail('https://cdn.discordapp.com/avatars/1157412588372631565/868b9245544b1965b61a6e375c4fb4db.webp?size=1024')
          .setFooter('wondexz tarafından geliştirildi.')
          .setTimestamp();

        logKanal.send(logEmbed);
      }
    }
  }
});



client.on('message', async message => {
  if (message.content.startsWith(`${prefix}sil`)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (!args.length || isNaN(args[0])) {
        const embed = new Discord.MessageEmbed()
        .setTitle('<a:carpi:1133820846553714709> Örnek kullanım')
        .setDescription('a!sil <sayı>')
        .setColor('#2137af')
          return message.channel.send(embed);
      }

      const amount = parseInt(args[0]);

      if (amount <= 0 || amount > 100) {
        const embed = new Discord.MessageEmbed()
        .setColor('#2137af')
        .setDescription('<a:carpi:1133820846553714709> Silme işlemi için 1 ile 100 arasında bir sayı belirtmelisiniz.')
          return message.channel.send(embed);
      }

      await message.channel.bulkDelete(amount, true).catch(err => {
          console.error(err);
          message.channel.send('Mesajları silerken bir hata oluştu.');
      });

      const embed = new Discord.MessageEmbed()
          .setColor('#2137af')
          .setDescription(`<a:tk:1133819271538036736> ${message.author}, tarafından ${amount} adet mesaj silindi.`);

      message.channel.send(embed);
  }
});


client.on('ready', () => {
  console.log("Discord'a bağlantı sağlandı.")


  const voiceChannelId = ayarlar.girilecek_ses_kanalı_id;
  const channel = client.channels.cache.get(voiceChannelId);
  if (channel && channel.type === 'voice') {
      channel.join().then(connection => {
          console.log('Bağlantı kuruldu.');
      }).catch(err => {
          console.error();
      });
  } else {
      console.error('Belirtilen sesli kanal bulunamadı.');
  }
});


client.on('ready', () => {
  
  const os = require("os");
  const si = require("systeminformation");

  const logChannelId = ayarlar.start_log_id;
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
    const startup = new Discord.MessageEmbed()
    .setTitle(client.user.username + " discord'a bağlandı!")
    .setDescription(client.user.username +"'in istatistikleri aşağıdadır")
    .addField('Prefix',ayarlar.prefix)
    .addField('Sunucular',client.guilds.cache.size)
    .addField('Kullanıcılar',client.users.cache.size)
    .addField("Kanallar", client.channels.cache.size.toLocaleString(), true)
    .addField('Ping',client.ws.ping)
    .addField('Bellek Kullanımı', (process.memoryUsage().heapUsed / 1024 / 512).toFixed(2) + " MB", true)
    .addField("Node.JS sürüm", `${process.version}`, true)
    .addField("Discord.JS sürüm", "v" + Discord.version, true)
    .addField("İşlemci", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``, true)
    .addField("Bit", `\`${os.arch()}\``, true)
    .setColor('#0f43e7')
    logChannel.send(startup);
  }
});

  
      console.log ("Discord apisine bağlantı sağlandı!");

    let isRestarting = false;

    client.on('message', async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(prefix)) return;
    
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
    
      if (command === 'restart') {
        if (message.author.id !== ayarlar.sahip) return;
    
        if (isRestarting) return;
        isRestarting = true;
    

        message.reply('Bot yeniden başlatılıyor... <a:restarticon:1133815427357757483>').then(async (msg) => {

          client.user.setStatus('idle');
          console.log('Bot 30 saniye içerisinde yeniden başlatılacaktır!')
    

          client.user.setActivity('Yeniden Başlatılıyorum', { type: 'PLAYING' });
    
          await new Promise(resolve => setTimeout(resolve, 30000));

          message.channel.send('Bot Başarıyla Yeniden Başlatıldı! <a:tk:1133819271538036736>')
          console.log('Bot yeniden başlatılıyor!')
    

          setTimeout(() => {
            process.exit();
          }, 30000);
        });
      }
    })

    client.on('messageDelete', async deletedMessage => {
      const mesajlog = client.channels.cache.get(ayarlar.mesaj_log);
      if (mesajlog) {
          const { content, author, createdAt, guild, channel } = deletedMessage;
          const embed = new Discord.MessageEmbed()
          .setTitle('**Mesaj Silindi!**')
          .setDescription(`\nKanal: <#${channel.id}>\nSilinen Mesaj: ${content}\nSilen Kişi: ${author.tag} (${author.id})\nSilme Tarihi: ${createdAt}`)
          .setColor('RANDOM')
          mesajlog.send(embed);
      }
  });

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.content !== newMessage.content) {
        const mesajlog = client.channels.cache.get(ayarlar.mesaj_log);
        if (mesajlog) {
          const embed = new Discord.MessageEmbed()
          .setTitle('**Mesaj Düzenlendi**')
          .setDescription(`\nEski Mesaj: ${oldMessage.content}\nYeni Mesaj: ${newMessage.content}\nKanal: <#${newMessage.channel.id}>\nDüzenleme Tarihi: ${newMessage.editedAt}`)
            mesajlog.send(embed);
        }
    }
});

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};



client.login(token);
