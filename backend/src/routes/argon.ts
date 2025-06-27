import argon2 from "argon2";

async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
}

async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
}

export { hashPassword, verifyPassword };
