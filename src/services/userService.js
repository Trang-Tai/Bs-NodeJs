import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);
let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let { isExist, user } = await checkUserEmail(email);
            if(isExist) {
                // user already exist
                // compare password
                let checkPassword = await bcrypt.compareSync(password, user.password);
                if (checkPassword) {
                    userData.errCode = 0;
                    userData.errMessage = 'OK';
                    delete user.password; // xóa bỏ thuộc tính password trong user để ko bị lộ pass
                    userData.user = user
                } else {
                    userData.errCode = 2;
                    userData.errMessage = 'Wrong Password';
                }
            } else {
                // return err(user not found)
                userData.errCode = 1;
                userData.errMessage = 'User not found. Your email is not exist in our system.';
            }
            resolve(userData);
        } catch (err) {
            reject(err);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                // attributes: ['email', 'roleId', 'password'],
                where: { email: userEmail },
                raw: true, // thuộc tính raw: false nó sẽ trả user dạng text/plain
                           //                 true thì sẽ trả user dạng object
                           // If set to true, field and virtual setters will be ignored
            })
            if(user) {
                resolve({ isExist: true, user });
            } else {
                resolve({ isExist: false, user });
            }
        } catch(err) {
            reject(err);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if(userId && userId !== 'ALL'){
                users = await db.User.findOne({
                    where: { id: userId, },
                    attributes: {
                        exclude: ['password']
                    },
                })
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check email is exist in the system ?
            let { isExist } = await checkUserEmail(data.email);
            if(isExist) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Email is already in used. Try another email',
                })
            }

            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                roleId: data.role,
                positionId: data.position,
                image: data.avatar,
            })
            resolve({
                errCode: 0,
                errMessage: 'OK',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                // raw: false,
            })
            if(!user) {
                return resolve({
                    errCode: 2,
                    errMessage: 'The user is not exist',
                })
            }

            // await user.destroy(); // Khi destroy kiểu này thì user phải là obj của sequelize (tức là raw = false)
            // hoặc dùng destroy như này:
            await db.User.destroy({
                where: { id: userId },
            })
            resolve({
                errCode: 0,
                errMessage: 'The user is deleted'
            })
        } catch (error) {
            reject(error);
        }
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.id) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Missing id parameter',
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            })
            if(user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.roleId = data.role;
                user.positionId = data.position;
                user.gender = data.gender;
                if(data.avatar) { // chỉ khi nào avatar thay đổi thì update, ko thì thôi
                    user.image = data.avatar;
                }
                await user.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update the user succeeds',
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'User is not found', 
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!typeInput) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing typeInput parameter',
                })
            }
            let res = {}
            let allcode = await db.Allcode.findAll({
                where: { type: typeInput, },
            });
            res.errCode = 0;
            res.data = allcode;
            resolve(res);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    handleUserLogin,
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData,
    getAllCodeService,
}