import userService from '../services/userService';
let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if(!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter',
        })
    }
    // check email exist
    // compare password
    // return userInfo
    // access_token: JWT
    let userInfo = await userService.handleUserLogin(email, password);

    return res.status(200).json({
        errCode: userInfo?.errCode,
        message: userInfo?.errMessage,
        userInfo: userInfo?.user || {}
    })
}

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id; // all, id

    if(!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing id parameter',
            users: [],
        })
    }

    let users = await userService.getAllUsers(id);
    console.log(users)

    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users,
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    console.log(message);
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => {
    let data = req.body.user;
    let message = await userService.updateUserData(data);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) => {
    let id = req.body.id;
    if(!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing id parameter',
        })
    }

    let message = await userService.deleteUser(id);
    return res.status(200).json(message);
}

let getAllCode = async (req, res) => {
    try {
        let typeInput = req.query.type;
        let data = await userService.getAllCodeService(typeInput);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports = {
    handleLogin,
    handleGetAllUsers,
    handleCreateNewUser,
    handleEditUser,
    handleDeleteUser,
    getAllCode,
}