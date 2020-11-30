const YtbReq = require("../../server/model/ytbReqTb.model");
const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const YtbReqResolvers = {
    Query: {
      ytbReq(_, args) {
        return YtbReq.find()
        .populate('../../server/model/userTbId')
        .exec();
      },
    },
      ytbReqTb : {
        async userTbId(_, args) {
          const user = await User.findById(_.userTbId._id);
          return user;
        },
    },
    Mutation: {
      // createUserTb: async (_, { userId, ytbReqTbId}) => {
      //   try {
      //     const ytbReqTb = YtbReq.findById(ytbReqTbId);
      //     await ytbReqTb.userTbId.push({"_id": userId});
      //     await ytbReqTb.userTbId.push({userId: userId});
      //     const savedYtbReqTb = await ytbReqTb.save();
      //     return savedYtbReqTb;
      //   }catch(error) {
      //     console.error(error.message);
      //   }
      // },

      // addUserTb(_, args) {
      //   try {
      //     const result = YtbReq.findByIdAndUpdate(args.userIdinput.ytbReqId, 
      //       { $push: {userTbId: args.userIdinput.userId}},
      //       {useFindAndModify: false}
      //     );
      //       return result;
      //   } catch(err) {
      //     console.log(err);
      //     throw err;
      //   }
      //   },
      }

    //  }
    };

  
  module.exports = YtbReqResolvers;