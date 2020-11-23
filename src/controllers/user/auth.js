const { default: ShortUniqueId } = require('short-unique-id');
const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const authHelper = require('../../helpers/authHelper');
const { User, Organisation, Wallet } = require('../../models/');
const sendMail = require("../../helpers/mailer");

const uid = new ShortUniqueId();

exports.signup = async (req, res, next) => {
    const { first_name, last_name, password, email, phone_number, referer } = req.body;
    try {
        let user_id = uid();
        const hashedPassword = authHelper.hashPassword(password);
        const wallet = new Wallet({ userId: user_id });
        const savedWallet = await wallet.save();
        const user = new User({
            email,
            password: hashedPassword,
            phone_number,
            user_id,
            first_name,
            last_name,
            wallet: savedWallet._id,
            role: 'USER',
            referer: referer || 'upbase admin',
        });
        const savedUser = await user.save();
        if (!savedUser) {
            next(new CustomError(400, "Could not save user"));
            return;
        }
        const token = authHelper.generateToken({ userId: savedUser.user_id }, "1d");
        const verifyUrl = `${req.protocol}:\/\/${req.headers.host}\/api\/v1\/auth\/verify?token=${token}`;
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

exports.verifyUser = async (req, res, next) => {
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

exports.userForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
		if (!user || !user.verified) {
            next(new CustomError(404, "The email that you provided is not registered"));
            return;
		}
        const token = authHelper.generateToken({ userId: user.user_id }, '1d');
        const resetUrl = `${req.protocol}:\/\/${req.headers.host}\/api\/v1\/auth\/reset-password?token=${token}`;
        if (process.env.NODE_ENV !== 'test') {
            const content = `<p>Hello ${user.last_name} ${user.first_name} , </p>
                <p>There was a request to reset your password</p>
                <p>Please click on the button below to get a new password</p>
                <a href='${resetUrl}'><button>Reset Password</button></a>
                <br>
                <p>If you did not make this request, just ignore this mail as nothing has changed.</p>
                <br>
                <p>For more enquiries, contact us via this <a href="mailto: admin@upbase.com.ng">account</a></p>
                <br>
                <br>
                <p>Best Regards, <b><span style="color: red;">Upbase Foods</span></b>Team</p>
            `;
            await sendMail(
                email, 
                'PASSWORD RESET',
                content
            );    
        } 
        return responseHandler(res, 200, resetUrl, `A password reset link has been sent to ${user.email}`);
    } catch (error) {
        console.log('Error from user forgot password >>>> ', error);
        return next(error);
    }
};

exports.userResetPassword = async (req, res, next) => {
    const { token } = req.query;
	const { password } = req.body;

	try {
		const { userId } = authHelper.verifyToken(token);

		const hashedPassword = authHelper.hashPassword(password);

		const user = await User.findOneAndUpdate(
			{ user_id: userId },
			{ $set: { password: hashedPassword } }
		);

		if (!user) {
            next(new CustomError(404, "User does not exist"));
            return;
        }
        const message = "Your password has been successfully changed. Proceed to login";
        return responseHandler(res, 200, user, message);
    } catch (error) {
        console.log('Error from user reset password >>>> ', error);
        return next(error);
    }
};

// if user forgets to verify upon sign up and the link sent to him has already expired
// he can request another link to be sent to him
exports.userRequestVerifyLink = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            next(new CustomError(404, "User does not exist"));
            return;
        }
        if (user.verified) {
            next(new CustomError(409, "Your account has been verified already."));
            return;
        }
        const generatedToken = authHelper.generateToken({ userId: user.user_id }, "1d");
        const resendUrl = `${req.protocol}:\/\/${req.headers.host}\/api\/v1\/auth\/verify?token=${generatedToken}`;
        const { first_name, last_name } = user;

        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Welcome to Upbase Foods</h2>
                <p>Hello ${first_name} ${last_name}, we are happy to have you create an account with us.</p>
                <p>Please click the link below to confirm your email</p><br>
                <h2><a href=${resendUrl}>Confirm Email</a></h2>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Verification',
                content
            );
        }
        return responseHandler(res, 200, resendUrl, "Please check your mail to verify your account");
    } catch (error) {
        console.log('Error from user requesting for another verification link >>>> ', error);
        return next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { user_id } = req.user;
    try {
        const user = await User.findOne({ user_id });
        if (!user) {
            next(new CustomError(401, "User does not exist."));
            return;
        }
        const isEqual = authHelper.comparePassword(oldPassword, user.password);
        if (!isEqual){
            next(new CustomError(401, "Incorrect password entered"));
            return;
        }
        const hashedPassword = authHelper.hashPassword(newPassword);
        const updatedUser = await User.findOneAndUpdate(
            { user_id },
            { $set: { password: hashedPassword } }
        );
        if (!updatedUser) {
            next(new CustomError(401, "Could not change update user password"));
            return;
        }
        return responseHandler(res, 200, updatedUser, "passwword updated");
    } catch (error) {
        console.log('Error from user requesting for another verification link >>>> ', error);
        return next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    const { user_id, role } = req.user;
    try {
        const user = await User.findOneAndUpdate(
            { user_id }, 
            {
                $set: {
                    ...req.body,
                },
            }
        );
        if (role === "COMPANY") {
            await Organisation.findOneAndUpdate(
                { userId: user_id }, 
                {
                    $set: {
                        ...req.body,
                    },
                }
            );
        }
        if (!user) {
            next(new CustomError(401, "Could not update user profile"));
            return;
        }
        return responseHandler(res, 200, user, "User updated successfully");
    } catch (error) {
        console.log('Error from updating user account >>>> ', error);
        return next(error);
    }
};
