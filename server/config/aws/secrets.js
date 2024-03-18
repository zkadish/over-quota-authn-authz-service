const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');
const dotenv = require("dotenv");
const fs = require("fs").promises;

const secret_name = "skillup-mongo-passwords";

const client = new SecretsManagerClient({
  region: "us-east-1",
});

const getSecrets = async () => {
  let secrets;

  try {
    const response = await client.send(
      // NOTE: only the SecretId is required to get the secrets... for more information see:
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );

    secrets = JSON.parse(response.SecretString);
    
    let secretsString = "";
    Object.keys(secrets).forEach((key) => {
      secretsString += `${key}=${secrets[key]}\n`;
    });
    
    //write to .env file at root level of project:
    await fs.writeFile(".env", secretsString);

    //configure dotenv package
		dotenv.config();
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  console.log('Secrets have been fetched!', secrets)
  return secrets;
}

module.exports = getSecrets;
