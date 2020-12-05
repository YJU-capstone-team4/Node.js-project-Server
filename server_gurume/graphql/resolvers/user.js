const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const UserResolvers = {
    Query: {
      user(_, args) {
        return User.find()
        .populate('../../server/model/folders.stores.ytbStoreTbId');
      },
      selectFlow(_, args, context) {
        return User
        // .aggregate(
        //   [
        //     {$match: {
        //       'folders.folderTitle' : args.folderName
        //     }
        //   },{
        //     $project: {
        //       folders: {
        //         $filter: {
        //           input: "$folders",
        //           as: "f",
        //           cond: {
        //             $eq: [
        //               "$$f.folderName",
        //               args.folderName
        //             ]
        //           }
        //         }
        //       },
        //       _id: 0
        //     }
        //   },{
        //     $lookup: {
        //       from: "ytbStoreTb",
        //       localField: "folders.stores.attractionTbId",
        //       foreignField: "_id",
        //       as: "ytbStoreTbId"
        //     }, 
        //     $lookup: {

        //       from: "attractionTb",
        //       localField: "folders.stores.attractionTbId",
        //       foreignField: "_id",
        //       as: "attractionTbId"
        //     }
        //   },
        //   {
        //     $skip: 0
        //   }
        // ])
        .find({'folders.folderTitle': args.folderTitle})
        .populate('../../server/model/folders.stores.ytbStoreTbId')
         .exec()
        .then(data => {
          console.log(data);
          return data;
        })
        .catch(err => console.log(err));
        //.then();

      },
      folders(_, args) {
        return User.findOne({'folders._id': args._id}).select('folders')
        .populate('../../server/model/folders.stores.ytbStoreTbId')         
        .exec()
        .then(data => {
          console.log(data);
          return data;
        })
        .catch(err => console.log(err));
      }
    },
    store : 
    {
    async ytbStoreTbId(_, args) {
      const ytbStore = await YtbStore.findById(_.ytbStoreTbId);
      return ytbStore;
    },
  }

  };
  
  module.exports = UserResolvers;