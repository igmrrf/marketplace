const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const { User } = require('../../models/');

exports.getUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ user_id: userId });
        if (!user) {
            next(new CustomError(404, "User not found or has been deleted"));
            return;
        }
        return responseHandler(res, 200, user, "User details found");

    } catch (error) {
        console.log(`Error from getting a user details >>> ${error}`);
		return next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const deletedUser = await User.findOneAndDelete({ user_id: userId });
        if (!deletedUser) {
            next(new CustomError(404, "User has already been deleted"));
            return;
        }
        return responseHandler(res, 200, deletedUser, "User deleted successfully");
    } catch (error) {
        console.log(`Error from deleting a user >>> ${error}`);
		return next(error);
    }
};

exports.editUserInfo = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { user_id: userId }, 
            {
                $set: {
                    ...req.body,
                },
            }
        );
        
        if (!updatedUser) {
            const errorMsg = "Could not update user. User does not exist or has been deleted";
            next(new CustomError(404, errorMsg));
            return;
        }
        return responseHandler(res, 200, updatedUser, "User updated successfully");
    } catch (error) {
        console.log(`Error from updating a user info >>> ${error}`);
		return next(error);
    }
};

exports.searchUsers = async (req, res, next) => {
    const { page = 1, limit = 10, queryString } = req.query;
    try {
        const query = {
            $or: [
                { 
                    email: {
                        $regex: queryString,
                        '$options': 'i',
                    },
                },
                { 
                    first_name: {
                        $regex: queryString,
                        '$options': 'i',
                    },
                },
                { 
                    last_name: {
                        $regex: queryString,
                        '$options': 'i',
                    }
                },
                {   
                    phone_number: {
                        $regex: queryString,
                        '$options': 'i',
                    },
                },
            ],
        };

        const users = await User
            .find(query)
            .select('email first_name last_name phone_number referer -_id')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = users.length;
        if (count === 0){
            next(new CustomError(404, "No user matches the search parameter."));
            return;
        }
        console.log('users', users);
		return res.status(200).json({
			message: `${count} ${count > 1 ? `Users`: `user`} found`,
			count,
			data: users,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		});
    } catch (error) {
        console.log(`Error from searching users >>> ${error}`);
		return next(error);
    }
};