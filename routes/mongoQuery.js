
module.exports = {

  save:function(model){
    return model.save()
  },

  findOne: function(model,id){
    
      return  model.findOne(id).exec()
  },

  find:function(model,query,selectedField,sortparams,join,start,length){

      if(length == null){
         length = 200
       }

      var Query ;
      var string = [] ;

      if(typeof join != "undefined"){
         join.forEach(function(element) {

            string.push(element)

         })

         Query =  model.find(query,selectedField).populate(string)

      }else{
         Query = model.find(query,selectedField)
      }

      return Query.sort(sortparams).skip(parseInt(start)).limit(parseInt(length)).exec()
  },

  findByIdAndUpdate:function(model,id,arg3){
    
    return model.findByIdAndUpdate({_id :id},{ $set: arg3 },{new:true})
  },

  delete:function(model,id){
    return model.findByIdAndRemove({_id : id}).exec()
  },

  update:function(model,con,updateData){

     return model.update(con,updateData,{multi:true})
  },

  count: function(model){

    return model.find().count()
  }




};
