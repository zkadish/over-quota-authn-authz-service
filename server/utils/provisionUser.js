const frameWorks = require('../services/frameWorks');

const provisionUser = async (user) => {
  try {
    // Remove when live - get and post Events for dev testing
    const events = await frameWorks.getEvents(user);
    await frameWorks.postEvents(user, { events });

    // Get default talk tracks, replace account_id and generate new talk track ids.
    const talkTracks = await frameWorks.getTalkTracks(user);
    // Create the new user's talk tracks
    await frameWorks.postTalkTracks(user, { talkTracks });

    // Get default battle cards, replace account_id and generate new battle card ids.
    const battleCards = await frameWorks.getBattleCards(user);

    // Add talk tracks order to battle cards
    for (let i = 0; i < talkTracks.length; i++) {
      if (i <= 1) battleCards[0]['talk-tracks'].push(talkTracks[i].id);
      if (i <= 2 && i <= 5) battleCards[1]['talk-tracks'].push(talkTracks[i].id);
      if (i === 6) battleCards[2]['talk-tracks'].push(talkTracks[i].id);
      if (i === 7) battleCards[3]['talk-tracks'].push(talkTracks[i].id);
    };

    // Create the new user's battle cards
    await frameWorks.postBattleCards(user, { battleCards });

    // Get default template order, replace account_id and generate new template ids.
    const templateOrder = await frameWorks.getTemplateOrder(user);
    // Create the new users default templateOrder
    await frameWorks.postTemplateOrder(user, templateOrder);

    // Get the default templates, replace account_id and ids with the ones from templateOrder
    const templates = await frameWorks.getTemplates(user, templateOrder);

    // Get default blocks, replace account_id and container_id with new template ids and generate new block ids
    const blocks = await frameWorks.getBlocks(user, templates);

    // Add blocks order to templates
    for (let i = 0; i < blocks.length; i++) {
      if (i <= 12) templates[0].blocks.push(blocks[i].id);
      if (i >= 13 && i <= 26) templates[1].blocks.push(blocks[i].id);
      if (i >= 27) templates[2].blocks.push(blocks[i].id);
    };

    // Get default Elements, replace account_id and container_id with new block ids and generate new element ids
    const elements = await frameWorks.getElements(user, blocks, talkTracks, battleCards);

    // Add elements order to blocks
    for (let i = 0; i < elements.length; i++) {
      if (i <= 1) blocks[0].elements.push(elements[i].id);
      if (i === 2) blocks[1].elements.push(elements[i].id);
      if (i >= 3 && i <= 7) blocks[2].elements.push(elements[i].id);
      if (i >= 8 && i <= 11) blocks[3].elements.push(elements[i].id);
      if (i >= 12 && i <= 15) blocks[4].elements.push(elements[i].id);
      if (i >= 16 && i <= 23) blocks[5].elements.push(elements[i].id);
      if (i >= 24 && i <= 28) blocks[6].elements.push(elements[i].id);
      if (i >= 29 && i <= 33) blocks[7].elements.push(elements[i].id);
      if (i === 34) blocks[8].elements.push(elements[i].id);
      if (i === 35) blocks[9].elements.push(elements[i].id);
      if (i === 36) blocks[10].elements.push(elements[i].id);
      if (i >= 37 && i <= 38) blocks[11].elements.push(elements[i].id);
      if (i >= 39 && i <= 41) blocks[12].elements.push(elements[i].id);
      if (i >= 42 && i <= 43) blocks[13].elements.push(elements[i].id);
      if (i === 44) blocks[14].elements.push(elements[i].id);
      if (i >= 45 && i <= 49) blocks[15].elements.push(elements[i].id);
      if (i >= 50 && i <= 53) blocks[16].elements.push(elements[i].id);
      if (i >= 54 && i <= 58) blocks[17].elements.push(elements[i].id);
      if (i >= 59 && i <= 61) blocks[18].elements.push(elements[i].id);
      if (i >= 62 && i <= 66) blocks[19].elements.push(elements[i].id);
      if (i >= 67 && i <= 71) blocks[20].elements.push(elements[i].id);
      if (i >= 72 && i <= 76) blocks[21].elements.push(elements[i].id);
      if (i >= 77 && i <= 79) blocks[22].elements.push(elements[i].id);
      if (i === 80) blocks[23].elements.push(elements[i].id);
      if (i === 81) blocks[24].elements.push(elements[i].id);
      if (i >= 82 && i <= 85) blocks[25].elements.push(elements[i].id);
      if (i >= 86 && i <= 88) blocks[26].elements.push(elements[i].id);
      if (i >= 89 && i <= 91) blocks[27].elements.push(elements[i].id);
      if (i === 92) blocks[28].elements.push(elements[i].id);
      if (i >= 93 && i <= 97) blocks[29].elements.push(elements[i].id);
      if (i >= 98 && i <= 101) blocks[30].elements.push(elements[i].id);
      if (i >= 102 && i <= 106) blocks[31].elements.push(elements[i].id);
      if (i >= 107 && i <= 112) blocks[32].elements.push(elements[i].id);
      if (i >= 113 && i <= 118) blocks[33].elements.push(elements[i].id);
      if (i >= 119 && i <= 124) blocks[34].elements.push(elements[i].id);
      if (i >= 125 && i <= 126) blocks[35].elements.push(elements[i].id);
      if (i === 127) blocks[36].elements.push(elements[i].id);
      if (i >= 128 && i <= 131) blocks[37].elements.push(elements[i].id);
      if (i >= 132 && i <= 134) blocks[38].elements.push(elements[i].id);
      if (i === 135) blocks[39].elements.push(elements[i].id);
      if (i === 136) blocks[40].elements.push(elements[i].id);
      if (i >= 137 && i <= 138) blocks[41].elements.push(elements[i].id);
      if (i >= 139 && i <= 142) blocks[42].elements.push(elements[i].id);
    };

    // Create the new users default templates
    await frameWorks.postTemplates({ templates });
    // Create the new users default blocks
    await frameWorks.postBlocks({ blocks });
    // Create the new users default elements
    await frameWorks.postElements({ elements });

  } catch (err) {
    console.log(err);
  }

  return user;
};


module.exports = provisionUser;
