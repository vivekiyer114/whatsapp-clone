import GroupDao from "../dao/group.js";
import MessageDao from "../dao/message.js";
import UserDao from "../dao/user.js";

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Group name is required!' })
        }

        const groupDao = new GroupDao();
        const group = await groupDao.createGroup(req.body);

        const userObjToUpdate = Object.assign({}, req.user);

        const groups = userObjToUpdate.groups || [];
        groups.push(group.insertedId);

        userObjToUpdate.groups = groups;

        const userDao = new UserDao();
        await userDao.updateUserByUserName(userObjToUpdate.username, {groups});

        return res.status(200).send("Group created!")

    } catch (err) {
        return res.status(err.status || 200).json({ message: err.message })
    }
}

export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params; 
        const { username } = req.body;

        if (!groupId || !username) {
            return res.status(400).json({ message: 'Group ID and username are required!' });
        }

        const groupDao = new GroupDao();
        const group = await groupDao.findGroupById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const userDao = new UserDao();
        const user = await userDao.findByUserName(username);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.groups.includes(group._id)) {
            return res.status(400).json({ message: 'User is already a member of the group' });
        }

        // Add the user to the group's members array
        user.groups.push(group._id);

        await userDao.updateUserByUserName(user.username, {groups: user.groups});

        return res.status(200).json({ message: 'User added to the group' });

    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
}

export const createMessage = async (groupId, userName, message) => {
    try {
      

        const groupDao = new GroupDao();
        const group = await groupDao.findGroupById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const userDao = new UserDao();
        const user = await userDao.findByUserName(userName);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const messageDao = new MessageDao();
        const messageId = await messageDao.createMessage(message);
  
        if (!group.messages){
            group.messages = [];
        }

        const newMessage = {
            message_id: messageId,
            user_id: user._id
        };

        group.messages.push(newMessage);

        await groupDao.updateGroupById(groupId, { messages: group.messages });

      
    } catch (err) {
        // log error
        console.log(err)
    }
}

export const getGroupData = async (req, res) => {
    try {
        const userName = req.params.username; 

        if (req.user.username !== userName) {
            return res.status(403).json({ message: 'Access denied. You can only access your own group data.' });
        }

        const userDao = new UserDao();
        const userGroupData = await userDao.getGroupData(userName);

        res.status(200).json(userGroupData);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
}
