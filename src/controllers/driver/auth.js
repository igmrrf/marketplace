const { default: ShortUniqueId } = require('short-unique-id');
const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const authHelper = require('../../helpers/authHelper');
const { Driver } = require('../../models/');
const sendMail = require("../../helpers/mailer");

const uid = new ShortUniqueId();

exports.signup = async (req, res, next) => {
    const { 
        first_name, last_name, password, email, phone_number, nextOfKinName, 
        nextOfKinRel, vehicle_number, nextOfKinPhoneNumber, city, street, houseNumber,
    } = req.body;
    try {
        const hashedPassword = authHelper.hashPassword(password);
        const driver = new Driver({
            email,
            password: hashedPassword,
            phone_number,
            user_id: uid(),
            first_name,
            last_name,
            next_of_kin: {
                name: nextOfKinName,
                relationship: nextOfKinRel,
                phone_number: nextOfKinPhoneNumber,
            },
            address: { city, street, houseNumber },
            vehicle_number,
            image: req.file && req.file.path,
        });
        const savedDriver = await driver.save();
        if (!savedDriver) {
            next(new CustomError(400, "Could not save driver"));
            return;
        }
        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Welcome to Upbase Foods</h2>
                <p>Hello ${first_name} ${last_name}, we are happy to have you create an account with us.</p>
                <p>Your registration as a driver is under-going review. <br>
                This may take a while as we are experiencing a larger than normal volume of driver requests recently
                and we are working through them as quickly as we can in order they are received. </p><br>
                <p>We would get back to you in due time. If you have other questions regarding your account, don't 
                hesitate to send us a mail.</p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Driver Application',
                content
            );
        }
        return responseHandler(res, 201, savedDriver, "Account application was successful. Check Mail for more Information.");
    } catch (error) {
        console.log(`Error from user registration >>> ${error}`);
		return next(error);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const driver = await Driver.findOne({ email });
        if (!driver) {
            next(new CustomError(404, "Ensure you enter the right credentials"));
            return;
        }
        if (!driver.verified) {
            next(new CustomError(401, "Your account hasn't been verified yet!"));
            return;
        }
        const isValid = authHelper.comparePassword(password, driver.password);
        if (!isValid) {
            next(new CustomError(401, "Ensure you enter the right credentials"));
            return;
        }
        const token = authHelper.generateToken({ userId: driver.user_id }, '1d');
        return responseHandler(res, 200, token, "Driver signed in successfully");
    } catch (error) {
        console.log('Error from user sign in >>>> ', error);
        return next(error);
    }
};
