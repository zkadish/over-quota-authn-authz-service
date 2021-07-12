const getTemplateOrder = async () => {
  try {
    const response = await fetch(
      'http://localhost:8080/api/v1/frameworks/template-order',
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'user-account-id': auth.user.user_account_id,
          // Authorization: auth.accessToken,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: JSON.stringify(body), // body data type must match "Content-Type" header
      },
    );
    const data = await response.json(); // parses JSON response into native JavaScript objects
    console.log(data);
    // TODO: handle success
  } catch (err) {
    // TODO: handle errors
  }
}

module.exports = {
  getTemplateOrder
}