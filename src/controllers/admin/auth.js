const { default: ShortUniqueId } = require('short-unique-id');
const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const authHelper = require('../../helpers/authHelper');
const { User } = require('../../models/');
const sendMail = require("../../helpers/mailer");

//Instantiate
const uid = new ShortUniqueId();

/**
 * Registers an admin user
 * @param name 
 * @param email
 * @param password
 * @param phone_number
 * @param referer - (optional) 
 * @returns userId - String
*/
exports.signup = async (req, res, next) => {
    const { first_name, last_name, password, email, phone_number, referer } = req.body;
    try {
        const hashedPassword = authHelper.hashPassword(password);
        const user = new User({
            email,
            password: hashedPassword,
            phone_number,
            user_id: uid(),
            first_name,
            last_name,
            role: 'ADMIN',
            referer: referer || 'upbase admin',
        });
        const savedUser = await user.save();
        if (!savedUser) {
            next(new CustomError(400, "Could not save admin"));
            return;
        }
        const token = authHelper.generateToken({ userId: savedUser.user_id }, "1d");
        const verifyUrl = `${req.protocol}:\/\/${req.headers.host}\/api\/v1\/admin\/auth\/verify?token=${token}`;
        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Welcome to Upbase Foods</h2>
                <p>Hello ${first_name} ${last_name}, we are happy to have you create an account with us.</p>
                <p>Please click the link below to confirm your email</p><br>
                <h2><a href=${verifyUrl}>Confirm Email</a></h2>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Registration',
                content
            );
        }
        return responseHandler(res, 201, verifyUrl, "Account registration successful. Check email for verication.");
    } catch (error) {
        console.log(`Error from user registration >>> ${error}`);
		return next(error);
    }
};

exports.verifyAdmin = async (req, res, next) => {
    const { token } = req.query;
    try {
        const  { userId } = authHelper.verifyToken(token);
        const user = await User.findOne({ user_id: userId });
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
			{ verified: true }
		);
		if (!foundUser) {
			next(new CustomError(404, "Unable to verify user"));
            return;
		}
        const message = "User account has been verified successfully. You can login."
        return responseHandler(res, 200, {}, message);
    } catch (error) {
        console.log('Error from user verification >>>> ', error);
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            next(new CustomError(404, "Ensure you enter the right credentials"));
            return;
        }
        if (!user.verified) {
            next(new CustomError(401, "You have to verify your account"));
            return;
        }
        const isValid = authHelper.comparePassword(password, user.password);
        if (!isValid) {
            next(new CustomError(401, "Ensure you enter the right credentials"));
            return;
        }
        const token = authHelper.generateToken({ userId: user.user_id }, '1d');
        return responseHandler(res, 200, token, "User signed in successfully");
    } catch (error) {
        console.log('Error from user sign in >>>> ', error);
        return next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    const { page = 1, limit = 10, filter } = req.query;
    try {
        let users;
		let count;
		if (filter) {
			if (filter.toString() == "verified") {
                users = await User.find({ verified: true })
                    .sort({ createdAt: -1 })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await User.countDocuments({ verified: true });
			} else if (filter.toString() == "not-verified") {
				users = await User.find({ verified: false })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await User.countDocuments({ verified: false });
			}
		} else {
			users = await User.find()
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
			count = await User.countDocuments();
		}

		if (count === 0) {
            next(new CustomError(404, "No users found."));
            return;
		}
		return res.status(200).json({
			message: `${count} ${count > 1 ? `Users`: `user`} found`,
			count,
			data: users,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		});
    } catch (error) {
        console.log('Error from getting all users >>>> ', error);
        return next(error);
    }
};
