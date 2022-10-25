import { Sequelize } from "sequelize";

const seq = new Sequelize('doctorpj', 'root', 't12345', {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false, // ko in ra câu truy vấn trên terminal
})

let connectDB = async () => {
    try {
        await seq.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connectDB;