const { default: ShortUniqueId } = require('short-unique-id');
const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const authHelper = require('../../helpers/authHelper');
const { User, Organisation, Wallet } = require('../../models/');
const sendMail = require("../../helpers/mailer");

const uid = new ShortUniqueId();

exports.signup = async (req, res, next) => {
    const { 
        name, address, password, email, phone_number, about, website,
    } = req.body;
    const userId = uid();
    try {
        const hashedPassword = authHelper.hashPassword(password);
        const wallet = new Wallet({ userId });
        const savedWallet = await wallet.save();
        const user = new User({
			first_name: name,
			email,
			password: hashedPassword,
            phone_number,
            wallet: savedWallet._id,
            user_id: userId,
            role: 'COMPANY',
		});
		const organisation = new Organisation({
            name,
            address,
            about,
            website,
		});

		user.organisation = organisation._id;
        organisation.users.push(user._id);
        organisation.userId = userId;

        const savedUser = await user.save();
        const savedOrg = await organisation.save();
        if (!savedUser || !savedOrg) {
            next(new CustomError(400, "Could not register company"));
            return;
        }
        
        const token = authHelper.generateToken(
            { userId: savedUser.user_id, orgName: name },
            "1d"
        );
        const verifyUrl = `${req.protocol}:\/\/${req.headers.host}\/api\/v1\/company\/auth\/verify?token=${token}`;

        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Welcome to Upbase Foods</h2>
                <p>Hello ${name}, <br> We are happy to have you create a company account with us.</p>
                <p>Please click the link below to confirm your email</p><br>
                <p><a href=${verifyUrl}>Confirm Email</a></p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Company Registration',
                content
            );
        }
        return responseHandler(res, 201, verifyUrl, "Account registration was successful. Check Mail to verify your account.");
    } catch (error) {
        console.log(`Error from company registration >>> ${error}`);
		return next(error);
    }
};

exports.verifyCompany = async (req, res, next) => {
    const { token } = req.query;
    try {
        const  { userId, orgName } = authHelper.verifyToken(token);
        const user = await User.findOne({ user_id: userId, first_name: orgName });
        if (!user) {
            next(new CustomError(404, "Invalid verification link"));
            return;
        }
		if (user.verified) {
			next(new CustomError(409, "This account has already been verified."));
            return;
		}
		const foundUser = await User.findOneAndUpdate(
            { user_id: userId },
            { 
                $set: { verified: true },
            },
            { new: true }
		);
		if (!foundUser) {
			next(new CustomError(404, "Unable to verify user"));
            return;
		}
        const message = "Your account has been verified successfully. You may proceed to login."
        return responseHandler(res, 200, foundUser, message);
    } catch (error) {
        console.log('Error from user verification >>>> ', error);
        return next(error);
    }
};

