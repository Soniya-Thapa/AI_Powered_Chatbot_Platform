import crypto from "crypto";

// Function to generate a random secret
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};
console.log("string : ",generateSecret())