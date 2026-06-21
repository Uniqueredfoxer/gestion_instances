import bcrypt from "bcryptjs";

const hash = await bcrypt.hash('@Adam123', 10);
console.log(hash)