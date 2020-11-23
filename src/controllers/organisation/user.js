const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const { User, Organisation } = require('../../models/');
const authHelper = require('../../helpers/authHelper');
const sendMail = require("../../helpers/mailer");

exports.getAllCompanyUsers = async (req, res, next) => {
    const { role, organisation } = req.user,
        { verified } = req.query;
    try {
        if (role !== 'COMPANY') {
            next(new CustomError(400, "Only company owner can view all their users"));
            return;
        }
        const users = await User.find({ organisation });
        const allCompanyUsers = users.map(user => {
            return {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                verified: user.verified,
            };
        });
        
        const allVerifiedUsers = [];
        const allUnverifiedUsers = [];
        allCompanyUsers.forEach(user => {
            if (user.verified) {
                return allVerifiedUsers.push(user);
            } else if (!user.verified) {
                return allUnverifiedUsers.push(user);
            }
        });

        let data = allCompanyUsers;
        if (verified === "true") data = allVerifiedUsers;
        if (verified === "false") data = allUnverifiedUsers;
        const message = "Users fetched";
        return responseHandler(res, 200, data, message);
    } catch (error) {
        console.log('Error from user verification >>>> ', error);
        return next(error);
    }
};

exports.getCompanyUser = async (req, res, next) => {
    const { userId } = req.params,
        { role, organisation } = req.user;
    try {
        if (role !== 'COMPANY') {
            next(new CustomError(400, "Only company owner can view a user in that company"));
            return;
        }
        const query = { organisation, user_id: userId };
        const user = await User.findOne(query);
        if (!user) {
            next(new CustomError(404, "User not found or has been deleted"));
            return;
        }
        const data = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
        }
        
        return responseHandler(res, 200, data, "User details found");

    } catch (error) {
        console.log(`Error from getting a user details >>> ${error}`);
		return next(error);
    }
};

exports.addCompanyUser = async (req, res, next) => {
    const { email } = req.body,
        { user_id, role } = req.user;
    try {
        if (role !== 'COMPANY') {
            next(new CustomError(400, "Only company owner can add a user to that company"));
            return;
        }
        const user = await User.findOne({ email });
        if (!user) {
            next(new CustomError(404, "User is not registered on the platform."));
            return;
        }
        const org = await Organisation.findOne({ userId: user_id }).populate("users");
        if (org.users.includes(user._id)) {
            next(new CustomError(409, "User already added to the company"));
            return;
        }
        
        org.users.push(user._id);
        user.organisation = org._id;
        await org.save();
        await user.save();

        if (!org) {
            next(new CustomError(404, "Only company accounts can add users to their organisation"));
            return;
        }
        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Upbase Foods Company Invitation</h2>
                <p>Hello ${user.first_name}, <br> You have been added as a member of ${org.name}.</p>
                <p style="color: #1968c3; font-size: 0.7rem;">
                <strong>Note:</strong> This invitation was intended for ${user.first_name} ${user.last_name}.
                If you were not expecting this invitation, you can contact the admin by replying this mail.
                </p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Company Invitation',
                content
            );
        }
        return responseHandler(res, 200, user, "User added successfully. ");

    } catch (error) {
        console.log(`Error from adding company user to upbase >>> ${error}`);
		return next(error);
    }
};

exports.removeUserFromComp = async (req, res, next) => {
    const { userId } = req.params,
        { user_id, organisation, role } = req.user;
    try {
        if (role !== 'COMPANY') {
            next(new CustomError(400, "Only company owner can add a user to that company"));
            return;
        }
        const user = await User.findOne({ userId });
        if (!user) {
            next(new CustomError(404, "User does not exist on Upbase Foods"));
            return;
        }
        const org = await Organisation.findOne({ 
            $or: [{ _id: organisation }, { userId: user_id }] 
        }).populate("users");
        if (!org) {
            next(new CustomError(404, "Only company accounts can add users to their organisation"));
            return;
        }
        if (!org.users.includes(user._id)) {
            next(new CustomError(409, "User is not part of the organisation"));
            return;
        }
        const userIndex = org.users.indexOf(user._id);
        if (userIndex > -1) {
            org.users.splice(userIndex, 1);
        }
        user.organisation = null;
        await org.save();
        await user.save();
        if (process.env.NODE_ENV !== 'test') {
            const content = `<h2 style="display: flex; align-items: center;">Upbase Foods Company Removal</h2>
                <p>Hello ${user.first_name}, <br> You are no longer a member of ${org.name}.</p>
                <p style="color: #1968c3; font-size: 0.7rem;">
                <strong>Note:</strong> This invitation was intended for ${user.first_name} ${user.last_name}.
                You have removed from <b>${org.name} </b>.
                </p>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Company Invitation',
                content
            );
        }
        return responseHandler(res, 200, org, "User removed successfully.");
    } catch (error) {
        console.log(`Error from removing user from company >>> ${error}`);
		return next(error);
    }
};
