const axios = require("axios");
const express = require("express");
const jwt = require("jsonwebtoken");
const QueryString = require("qs");

require("dotenv").config();

const app = express();
const port = 3000;

app.get("/", async (_req, _res) => {
  const date = new Date();
  const timeNow = date.getTime() / 1000;
  const timeFuture = addMinutes(date, 30).getTime() / 1000;

  const fixedKey = process.env.PRIVATE_KEY.replace(
    new RegExp("\\\\n", "g"),
    "\n"
  );

  try {
    const jwtToken = jwt.sign(
      {
        iss: "lick-reviews@lick-website.iam.gserviceaccount.com",
        scope: "https://www.googleapis.com/auth/business.manage",
        aud: "https://oauth2.googleapis.com/token",
        exp: timeFuture,
        iat: timeNow,
      },
      fixedKey,
      { algorithm: "RS256" }
    );

    var data = QueryString.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    });

    var config = {
      method: "post",
      url: "https://oauth2.googleapis.com/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    const authResponse = await axios(config);
    console.log(
      "🚀 ~ file: index.js ~ line 54 ~ app.get ~ authResponse",
      authResponse
    );

    const accountRes = await axios({
      method: "get",
      url: "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      headers: {
        Authorization: `${authResponse.data.token_type} ${authResponse.data.access_token}`,
      },
    });
    console.log(
      "🚀 ~ file: index.js ~ line 63 ~ app.get ~ accountRes",
      accountRes.data
    );

    const inviteRes = await axios({
      method: "post",
      url: `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/104102682614641845545/invitations/L115116701173454421616:accept`,
      headers: {
        Authorization: `${authResponse.data.token_type} ${authResponse.data.access_token}`,
      },
    });
    console.log(
      "🚀 ~ file: index.js ~ line 63 ~ app.get ~ inviteRes",
      inviteRes.data
    );

    const locationsRes = await axios({
      method: "get",
      url: `https://mybusinessbusinessinformation.googleapis.com/v1/${accountRes.data.accounts[0].name}/locations?readMask=storeCode,regularHours,name,languageCode,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,specialHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,profile,relationshipData,moreHours`,
      headers: {
        Authorization: `${authResponse.data.token_type} ${authResponse.data.access_token}`,
      },
    });

    console.log(
      "🚀 ~ file: index.js ~ line 79 ~ app.get ~ locationsRes",
      locationsRes.data
    );

    const reviewsRes = await axios({
      method: "get",
      url: `https://mybusiness.googleapis.com/v4/${accountRes.data.accounts[0].name}/${locationsRes.data.locations[0].name}/reviews`,
      headers: {
        Authorization: `${authResponse.data.token_type} ${authResponse.data.access_token}`,
      },
    });

    console.log(
      "🚀 ~ file: index.js ~ line 62 ~ app.get ~ reviewsRes",
      reviewsRes.data
    );
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 38 ~ app.get ~ err", err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
