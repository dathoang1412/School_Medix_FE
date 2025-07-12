import { getUser } from "./src/service/authService.js";

console.log("Parent id: ", getUser()?.id)