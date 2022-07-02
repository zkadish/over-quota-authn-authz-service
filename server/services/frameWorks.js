const axios = require('axios');
const { uuid } = require('../utils/data');

let domain = 'https://dev.frameworks.service.viewportmedia.org';
if (process.env.NODE_ENV === 'production') {
  domain = 'https://dev.frameworks.service.viewportmedia.org';
}
if (process.env.NODE_ENV === 'development') {
  domain = 'https://dev.frameworks.service.viewportmedia.org';
}
if (process.env.NODE_ENV === 'local') {
  domain = 'http://localhost:9999';
}

console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.MODE:', process.env.MODE);
console.log('frameworks domain:', domain);

const weekday = dateObj => {
  let day = null;
  switch (dateObj.getDay()) {
    case 0:
      day = 'Sunday';
      break;
    case 1:
      day = 'Monday';
      break;
    case 2:
      day = 'Tuesday';
      break;
    case 3:
      day = 'Wednesday';
      break;
    case 4:
      day = 'Thursday';
      break;
    case 5:
      day = 'Friday';
      break;
    default:
      day = 'Saturday';
  }

  return day;
};
const getMonth = dateObj => {
  let month = null;
  switch (dateObj.getMonth()) {
    case 0:
      month = 'January';
      break;
    case 1:
      month = 'February';
      break;
    case 2:
      month = 'March';
      break;
    case 3:
      month = 'April';
      break;
    case 4:
      month = 'May';
      break;
    case 5:
      month = 'June';
      break;
    case 6:
      month = 'July';
      break;
    case 7:
      month = 'August';
      break;
    case 8:
      month = 'September';
      break;
    case 9:
      month = 'October';
      break;
    case 10:
      month = 'November';
      break;
    default:
      month = 'December';
  }
  return month;
};
const getTodayOffSet = (offSet = 0) => {
  const dateObj = new Date();
  const offSetObj = new Date(dateObj.setDate(dateObj.getDate() + offSet));
  const date = offSetObj.getDate();
  const year = offSetObj.getFullYear();
  return {
    date: `${weekday(offSetObj)}, ${getMonth(offSetObj)} ${date} ${year}`,
    dateObj: offSetObj,
  };
};

/**
 * These functions are intended as helpers to use and test Call Events
 * This function only gets fired on user password creation...
 */
// TODO: rename this function provisionDefaultEvents
 const getEvents = async (user) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/events`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { events } = response.data;
    const userEvents = events.map((e, i) => {
      const event = { ...e };
      delete event._id;
      // event.id = uuid(); // the id is being used to match it with the appropriate day
      event.account_id = user.account_id;
      event.dateObj = getTodayOffSet(-1).dateObj;
      event.start.date = getTodayOffSet(-1).date;
      event.end.date = getTodayOffSet(-1).date;
      return event;
    });
    return userEvents;
  } catch (err) {
    console.log(err);
  }
};

const postEvents = async (user, events) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/events`,
      data: events,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': user.account_id,
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
};

/**
 * These functions are a part of user provisioning and
 * only get fired on user password creation...
 */

const getTalkTracks = async (user) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/talk-tracks`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { talkTracks } = response.data;
    const userTalkTracks = talkTracks.map((t, i) => {
      // const id = uuid();
      const talkTrack = { ...t };
      delete talkTrack._id;
      talkTrack.id = uuid();
      talkTrack.library_id = uuid();
      talkTrack.account_id = user.account_id;
      return talkTrack;
    });
    return userTalkTracks;
  } catch (err) {
    console.log(err);
  }
};

const postTalkTracks = async (user, talkTracks) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/talk-tracks`,
      data: talkTracks,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': user.account_id,
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
};

const getBattleCards = async (user) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/battle-cards`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { battleCards } = response.data;
    const userBattleCards = battleCards.map((b, i) => {
      // const id = uuid();
      const battleCard = { ...b };
      delete battleCard._id;
      battleCard['talk-tracks'] = [];
      battleCard.id = uuid();
      battleCard.library_id = uuid();
      battleCard.account_id = user.account_id;
      return battleCard;
    });
    return userBattleCards;
  } catch (err) {
    console.log(err);
  }
};

const postBattleCards = async (user, battleCards) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/battle-cards`,
      data: battleCards,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': user.account_id,
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
};

const getTemplateOrder = async (user) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/template-order`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { data } = response;
    delete data._id;
    data.account_id = user.account_id;
    data.id = uuid();
    data.templates = data.templates.map(() => uuid());
    data.system = false;
    return data;
  } catch (err) {
    console.log(err);
  }
}

const postTemplateOrder = async (user, templateOrder) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/template-order`,
      data: templateOrder,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': user.account_id,
        // Authorization: auth.accessToken,
      }
    })
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
}

const getTemplates = async (user, templateOrder) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/templates`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { templates } = response.data;
    const userTemplates = templates.map((t, i) => {
      const template = { ...t };
      delete template._id;
      template.blocks = [];
      template.id = templateOrder.templates[i];
      template.account_id = user.account_id;
      return template;
    });
    return userTemplates;
  } catch (err) {
    console.log(err);
  }
}

const postTemplates = async (templates, blocks) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/templates`,
      data: templates,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
}

const getBlocks = async (user, templates) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/blocks`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { blocks } = response.data;
    const userBlocks = blocks.map((b, i) => {
      const block = { ...b };
      delete block._id;
      block.elements = [];
      block.id = uuid();
      block.account_id = user.account_id;
      if (i >= 0 && i <= 12) block.container_id = templates[0].id;
      if (i >= 13 && i <= 26) block.container_id = templates[1].id;
      if (i >= 27 && i <= 42) block.container_id = templates[2].id;
      return block;
    })
    return userBlocks;
  } catch (err) {
    console.log(err);
  }
}

const postBlocks = async (blocks) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/blocks`,
      data: blocks,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
}

const getElements = async (user, blocks, talkTracks, battleCards) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${domain}/api/v1/frameworks/elements`,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
    // sanitize and update the dto
    const { elements } = response.data;
    const userElements = elements.map((e, i) => {
      const element = { ...e };
      delete element._id;
      switch (element.type) {
        case 'talk-track':
          // the element's id is the talk tracks index
          // we need the talk tracks id to be the elements id
          // so that every instance of the talk track has the 
          // talk track id from the library.
          // TODO: change the element.id to a unique uuid after changing tracking reference over to library_id
          // element.id = talkTracks[element.id].id;
          element.library_id = talkTracks[element.id].library_id;
          element.id = uuid();
          break;
        case 'battle-card':
          // the element's id is the battle cards index
          // we need the battle cards id to be the elements id
          // so that every instance of the battle card has the 
          // battle card id from the library.
          element['talk-tracks'] = battleCards[element.id]['talk-tracks'];
          // TODO: change the element.id to a unique uuid after changing tracking reference over to library_id
          // element.id = battleCards[element.id].id;
          element.library_id = battleCards[element.id].library_id;
          element.id = uuid();
          break;
        default:
          element.id = uuid();
      }
      element.account_id = user.account_id;
      // Set element.container_id to the new block id which contains it.
      if (i <= 1) element.container_id = blocks[0].id;
      if (i === 2) element.container_id = blocks[1].id;
      if (i >= 3 && i <= 7) element.container_id = blocks[2].id;
      if (i >= 8 && i <= 11) element.container_id = blocks[3].id;
      if (i >= 12 && i <= 15) element.container_id = blocks[4].id;
      if (i >= 16 && i <= 23) element.container_id = blocks[5].id;
      if (i >= 24 && i <= 28) element.container_id = blocks[6].id;
      if (i >= 29 && i <= 33) element.container_id = blocks[7].id;
      if (i === 34) element.container_id = blocks[8].id;
      if (i === 35) element.container_id = blocks[9].id;
      if (i === 36) element.container_id = blocks[10].id;
      if (i >= 37 && i <= 38) element.container_id = blocks[11].id;
      if (i >= 39 && i <= 41) element.container_id = blocks[12].id;
      if (i >= 42 && i <= 43) element.container_id = blocks[13].id;
      if (i === 44) element.container_id = blocks[14].id;
      if (i >= 45 && i <= 49) element.container_id = blocks[15].id;
      if (i >= 50 && i <= 53) element.container_id = blocks[16].id;
      if (i >= 54 && i <= 58) element.container_id = blocks[17].id;
      if (i >= 59 && i <= 61) element.container_id = blocks[18].id;
      if (i >= 62 && i <= 66) element.container_id = blocks[19].id;
      if (i >= 67 && i <= 71) element.container_id = blocks[20].id;
      if (i >= 72 && i <= 76) element.container_id = blocks[21].id;
      if (i >= 77 && i <= 79) element.container_id = blocks[22].id;
      if (i === 80) element.container_id = blocks[23].id;
      if (i === 81) element.container_id = blocks[24].id;
      if (i >= 82 && i <= 85) element.container_id = blocks[25].id;
      if (i >= 86 && i <= 88) element.container_id = blocks[26].id;
      if (i >= 89 && i <= 91) element.container_id = blocks[27].id;
      if (i === 92) element.container_id = blocks[28].id;
      if (i >= 93 && i <= 97) element.container_id = blocks[29].id;
      if (i >= 98 && i <= 101) element.container_id = blocks[30].id;
      if (i >= 102 && i <= 106) element.container_id = blocks[31].id;
      if (i >= 107 && i <= 112) element.container_id = blocks[32].id;
      if (i >= 113 && i <= 118) element.container_id = blocks[33].id;
      if (i >= 119 && i <= 124) element.container_id = blocks[34].id;
      if (i >= 125 && i <= 126) element.container_id = blocks[35].id;
      if (i === 127) element.container_id = blocks[36].id;
      if (i >= 128 && i <= 131) element.container_id = blocks[37].id;
      if (i >= 132 && i <= 134) element.container_id = blocks[38].id;
      if (i === 135) element.container_id = blocks[39].id;
      if (i === 136) element.container_id = blocks[40].id;
      if (i >= 137 && i <= 138) element.container_id = blocks[41].id;
      if (i >= 139 && i <= 142) element.container_id = blocks[42].id;
      return element;
    })
    return userElements;
  } catch (err) {
    console.log(err);
  }
};

const postElements = async (elements) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${domain}/api/v1/frameworks/elements`,
      data: elements,
      headers: {
        'Content-Type': 'application/json',
        'user-account-id': 'all-accounts',
        // Authorization: auth.accessToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getEvents,
  postEvents,
  getTalkTracks,
  postTalkTracks,
  getBattleCards,
  postBattleCards,
  getTemplateOrder,
  postTemplateOrder,
  getTemplates,
  postTemplates,
  getBlocks,
  postBlocks,
  getElements,
  postElements,
};
