import { MessageActionRow, MessageButton } from "discord-buttons";
import { GuildMember, MessageEmbed } from "discord.js";
import { client } from "../initClient";

const userValidationWithChannel = async (member: GuildMember) => {
    const { user, guild } = member;

    const settings = client.getSettings(guild.id);

    const acceptButton = new MessageButton()
        .setLabel("Accept")
        .setStyle("green")
        .setDisabled(true)
        .setID(`accept_${guild.id}`);

    const denyButton = new MessageButton()
        .setLabel("Deny")
        .setStyle("red")
        .setDisabled(true)
        .setID(`deny_${guild.id}`);

    const row = new MessageActionRow()
        .addComponent(acceptButton)
        .addComponent(denyButton);

    const welcomeEmbed = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle(`Welcome to ${guild.name}`)
        .setDescription(
            `Please Review **${guild.name}'s** Rules and accept or deny them. Be aware that if you deny the rules you will be removed from **${guild.name}**. I will wait 5 minutes to enable the buttons in order to give plenty of time to review the rules.`
        )
        .addField("Rules", settings.rules)
        .setThumbnail(guild.iconURL())
        .setTimestamp(Date.now());

    const verificationMessage = await user.send({
        // @ts-ignore
        component: row,
        embed: welcomeEmbed,
    });

    setTimeout(() => {
        acceptButton.setDisabled(false);
        denyButton.setDisabled(false);

        const row = new MessageActionRow()
            .addComponent(acceptButton)
            .addComponent(denyButton);
        //@ts-ignore
        verificationMessage.edit({ component: row, embed: welcomeEmbed });
    }, 5000);
};

export default userValidationWithChannel;
