import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prismaClient = new PrismaClient();

const getInfo = async (id) => {
  if (!id) {
    return null;
  }
  try {
    const resp = await prismaClient.scopes.findFirst({
      where: {
        id: id,
      },
      include: {
        account: true,
      },
    });
    return resp;
  } catch (e) {
    return null;
  }
};

export const getUrl = async (id) => {
  const data = await getInfo(id);
  if (!data) {
    return null;
  }
  const clientId = data?.account?.client_id;
  const redirectUri = data?.account?.redirect_uri;
  const scope = data?.scopes;
  if (data?.account?.type === "Microsoft") {
    const finalScope = scope.join(" ");
    const baseUrl =
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      state: id,
      redirect_uri: redirectUri,
      scope: finalScope,
    });
    return `${baseUrl}?${params.toString()}`;
  } else if (data?.account?.type === "Google") {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: clientId,
      state: id,
      redirect_uri: redirectUri,
      response_type: "code", // This indicates you're expecting an authorization code.
      scope: scope.join(" "), // Scopes need to be space-separated.
      access_type: "offline", // Allows getting a refresh token.
    });
    return `${baseUrl}?${params.toString()}`;
  } else if (data?.account?.type === "Github") {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const params = new URLSearchParams({
      client_id: clientId,
      state: id,
      redirect_uri: redirectUri,
      scope: scope.join(" "), // Scopes need to be space-separated.
    });
    return `${baseUrl}?${params.toString()}`;
  } else {
    return null;
  }
};

const getMicrosoftToken = async (data, code) => {
  const clientId = data?.account?.client_id;
  const redirectUri = data?.account?.redirect_uri;
  const clientSecret = data?.account?.client_secret;
  try{
    const tokenResponse = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret, // Required for confidential clients
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      return tokenResponse.data;
  }
  catch(e){
    console.log(e);
    return null;
  }
};

const getGoogleToken = async (data, code) => {
  const clientId = data?.account?.client_id;
  const redirectUri = data?.account?.redirect_uri;
  const clientSecret = data?.account?.client_secret;
  try{
    const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret, // Required for confidential clients
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      return tokenResponse.data;
  }
  catch(e){
    console.log(e);
    return null;
  }
};

const getGithubToken = async (data, code) => {
    const clientId = data?.account?.client_id;
    const redirectUri = data?.account?.redirect_uri;
    const clientSecret = data?.account?.client_secret;
    try{
      const tokenResponse = await axios.post(
          "https://github.com/login/oauth/access_token",
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
          }).toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept" : "application/json" },
          }
        );
        return tokenResponse.data;
    }
    catch(e){
      console.log(e);
      return null;
    }
  };

export const getToken = async (code, id,type) => {
  if (!(code && id)) {
    return null;
  }
  const data = await getInfo(id);
  if (!data) {
    return null;
  }
  if (data?.account?.type === "Microsoft" && type === "microsoft") {
    const resp = await getMicrosoftToken(data, code);
    return resp;
  } else if (data?.account?.type === "Google" && type === "google") {
    const resp = await getGoogleToken(data, code);
    return resp;
  } else if (data?.account?.type === "Github" && type === "github") {
    const resp = await getGithubToken(data, code);
    return resp;
  } else {
    return null;
  }
};
