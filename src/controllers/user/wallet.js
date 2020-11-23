const { default: ShortUniqueId } = require('short-unique-id');
const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const authHelper = require('../../helpers/authHelper');
const { User, Organisation, Wallet } = require('../../models/');
const sendMail = require("../../helpers/mailer");

const uid = new ShortUniqueId();

exports.getVerificationCode = async (req, res, next) => {
    // sends the one time code that is stored in the user wallet to the user email
    const { user_id, email, first_name } = req.user;
    try {
        const code = uid();
        const expirationTime = Date.now() + 900000; // 15 mins
        const userWallet = await Wallet.findOneAndUpdate(
            { userId: user_id },
            {
                $set: {
                    pin: code,
                    pinExpire: expirationTime,
                }
            },
            { new: true }
        );
        if (!userWallet) {
            next(new CustomError(404, "Could not load user's wallet"));
            return;
        }
        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Upbase Foods</h2>
                <p>Hello ${first_name}, <br>
                This is the verification code for the transaction you want to make.
                </p>
                <h3>${code}</h3>.
                <p><b>NOTE:</b> This is a one time code that expires after 15 minutes
                 and as such cannot be re-used.</p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Wallet Access Verification Code',
                content
            );
        }
        return responseHandler(res, 200, userWallet, "Check email for verication code");

    } catch (error) {
        console.log(`Error from getting verification code >>> ${error}`);
		return next(error);
    }
};

exports.sendWalletMoney = async (req, res, next) => {
    // code is verified and user must have 500 or above before he can send money 
    const { userId, pin, amount } = req.body,
        { last_name, first_name } = req.user;
    try {
        const userWallet = await Wallet.findOne(
            { 
              pin, 
              pinExpire: { 
                $gt: Date.now(),
              },
            }
        );
        if (!userWallet) {
            next(new CustomError(422, "Verification code is invalid or has expired."));
            return;
        }
        if (userWallet.amount < 500) {
            next(new CustomError(400, "You must have 500 or above to make a transfer from your wallet"));
            return;
        }
        if (amount > userWallet.amount) {
            next(new CustomError(400, "Insufficient balance"));
            return;
        }
        const recipientWallet = await Wallet.findOne({ userId: userId });
        if (!recipientWallet) {
            next(new CustomError(404, "Invalid User Id entered"));
            return;
        }
        const user = await User.findOne({ user_id: userId });
        if (!user) {
            next(new CustomError(404, "User does not exist or deleted already"));
            return;
        }
        recipientWallet.amount += amount;
        userWallet.amount -= amount;
        userWallet.pin = null; 
        userWallet.pinExpire = null; 

        await userWallet.save();
        await recipientWallet.save();

        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Upbase Foods</h2>
                <p>Hello ${user.first_name}, <br>
                Your Upbase Foods wallet has been credited with <strong>${amount}</strong>
                by ${first_name} ${last_name}.
                </p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                user.email, 
                'Wallet Credit Alert',
                content
            );
        }
        return responseHandler(res, 200, userWallet, "Transfer made successfully");

    } catch (error) {
        console.log(`Error from sending money from wallet >>> ${error}`);
		return next(error);
    }
};
