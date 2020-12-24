const YtbReq = require("../../server/model/ytbReqTb.model");
const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const YtbReqResolvers = {
    Query: {
      ytbReq(_, args) {
        return YtbReq.find()
        .populate({path : '../../server/model/userTbId'})//,
                  // match : args._id})
        .exec()
      },
    },
      ytbReqTb : {
        async userTbId(_, args) {
          const user = await User.findById(_.userTbId._id)
          .exec()
            // .then(data => {
            //   const folder = data.folders.id(args._id);
            //   console.log(data);
            //   return data;
            // })
            // .catch(err => console.log(err));
          },
        },

          // let ids = '';
          // user.array.foreach(element => {
          //   ids = element.id;
          // });

          // const data = await YtbReq.find({
          //   "userTbId": {$in:ids}
          // })
          // .populate({
          //   path: 'userTbId'
          // })
          // .exec();


         // return user;
          //return user.map((id) => ({_id : id}));
          //  await YtbReq.populate(_, {path: '../../server/model/userTbId'});

          //  return _._id;

          //   .then(data => {
          //     console.log(data);
          //     return data;
          //   })
          //   .catch(err => console.log(err))
          // ;
          //return user;
    //     },
    // },
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