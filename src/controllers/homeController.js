import db from '../models/index';
import CRUDService from '../services/CRUDService';

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        // console.log(data);
        res.render('homepage.ejs', {
            data: JSON.stringify(data),
        });
    } catch(e) {
        console.log(e)
    }
}

let getAboutPage = (req, res) => {
    res.render('./test/about.ejs')
}

let getCRUD = (req, res) => {
    res.render('./crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    res.send(message);
}

let displayGetCRUD = async (req, res) => {
    let users = await CRUDService.getAllUsers();
    res.render('./displayCRUD.ejs', {
        dataTable: users,
    })
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('./editCRUD.ejs', {
            userData,
        });
    } else {
        return res.send('user not found');
    }
}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUserData(data);
    return res.render('./displayCRUD.ejs', {
        dataTable: allUsers,
    })
}

let deleteCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId) {
        await CRUDService.deleteUserById(userId);
        res.send('delete the user succeed');
    } else {
        res.send('User not found');
    }
}

export default {
    getHomePage,
    getAboutPage,
    getCRUD,
    postCRUD,
    displayGetCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD,
};