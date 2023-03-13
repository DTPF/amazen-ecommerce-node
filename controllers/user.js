const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const User = require("../models/User");
const { SALTROUNDS } = require("../env");
const { userMessage } = require("../responsesMessages/user.messages");

function signUp(req, res) {
  const user = new User();
  const { name, lastname, email, address, password, repeatPassword } = req.body;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const emailValidation = emailRegex.test(email);

  user.name = name;
  user.lastname = lastname;
  user.email = email && email.toLowerCase();
  user.role = "user";
  user.address.street = address.street;
  user.address.city = address.city;
  user.address.country = address.country;
  user.address.province = address.province;
  user.address.postalCode = address.postalCode;
  user.createdAt = Date.now();
  user.updatedAt = Date.now();

  // Name and lastname
  if (!name) {
    return res.status(400).send({ status: 400, message: userMessage.nameEmpty });
  }

  // Email requirements
  if (!email) {
    return res.status(400).send({ status: 400, message: userMessage.emailEmpty });
  }

  if (!emailValidation) {
    return res.status(400).send({ status: 400, message: userMessage.emailNotValid });
  }

  // Password requirements
  if (!password) {
    return res.status(400).send({ status: 400, message: userMessage.passwordEmpty });
  }
  if (password.length < 6) {
    return res.status(400).send({ status: 400, message: userMessage.passwordMinLength });
  }
  if (!repeatPassword) {
    return res.status(400).send({ status: 400, message: userMessage.repeatPasswordEmpty });
  }

  if (password !== repeatPassword) {
    return res.status(400).send({ status: 400, message: userMessage.passwordNotMatch });
  }

  bcrypt.genSalt(SALTROUNDS, function (err, salt) {
    if (err) {
      return res.status(500).send({ status: 500, message: userMessage.bcryptSalt });
    }
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        return res.status(501).send({ status: 501, message: userMessage.passwordEncryptFailed });
      } else {
        user.password = hash;
        user.save()
          .then(userStored => {
            if (!userStored) {
              return res.status(400).send({ status: 400, message: userMessage.serverError });
            }
            return res.status(200).send({
              status: 200,
              message: userMessage.userCreated,
              user: userStored,
            });
          })
          .catch((err) => {
            if (err) {
              return res.status(400).send({ status: 400, message: userMessage.userExists });
            }
          });
      }
    });
  });
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email && params.email.toLowerCase();
  const password = params.password;

  if (!email) {
    return res.status(400).send({ status: 400, message: userMessage.emailEmpty });
  }
  if (!password) {
    return res.status(400).send({ status: 400, message: userMessage.passwordEmpty });
  }

  User.findOne({ email })
    .then(userStored => {
      if (!userStored) {
        return res.status(400).send({ status: 400, message: userMessage.userNotFound });
      }
      bcrypt.compare(password, userStored.password, (err, check) => {
        if (err) {
          return res.status(500).send({ status: 500, message: userMessage.serverError });
        }
        if (!check) {
          return res.status(400).send({ status: 400, message: userMessage.passwordNotValid });
        }
        res.status(200).send({
          status: 200,
          accessToken: jwt.createAccessToken(userStored),
          refreshToken: jwt.createRefreshToken(userStored),
        });
      });
    })
    .catch(err => {
      if (err) {
        return res.status(501).send({ status: 501, message: userMessage.serverError });
      }
    })
}

function getUsers(req, res) {
  User.find()
    .then((users) => {
      if (!users) {
        return res.status(404).send({ status: 404, message: userMessage.userNotFound });
      } else {
        return res.status(200).send({ status: 200, users: users });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: userMessage.serverError });
      }
    });
}

function uploadAvatar(req, res) {
  const params = req.params;
  const path = req.files.avatar && req.files.avatar.path;

  User.findById({ _id: params.id })
    .then(userData => {
      if (!userData) {
        path && fs.unlinkSync(path);
        return res.status(404).send({ status: 404, message: userMessage.userNotFound });
      }

      let user = userData;
      const avatarNameOld = user.avatar;
      const filePathOld = "./uploads/avatar/" + avatarNameOld;

      if (req.files.avatar) {
        let filePath = path;
        let fileSplit = filePath.split("/");
        let fileName = fileSplit[2];
        let extSplit = fileName.split(".");
        let fileExt = extSplit[1] && extSplit[1].toLowerCase();

        if (fileExt !== "png" && fileExt !== "jpg" && fileExt !== "jpeg") {
          path && fs.unlinkSync(path);
          return res.status(400).send({ status: 400, message: userMessage.extensionNotValid });
        }

        user.avatar = fileName;
        user.updatedAt = Date.now();

        User.findByIdAndUpdate({ _id: params.id }, user)
          .then(userResult => {
            if (!userResult) {
              path && fs.unlinkSync(path);
              return res.status(404).send({ status: 404, message: userMessage.userNotFound });
            }
            (avatarNameOld !== undefined) && fs.unlinkSync(filePathOld);
            return res.status(200).send({ status: 200, avatarName: fileName });
          })
          .catch(err => {
            if (err) {
              path && fs.unlinkSync(path);
              return res.status(500).send({ status: 500, message: err });
            }
          })
      } else {
        path && fs.unlinkSync(path);
        return res.status(404).send({ status: 404, message: userMessage.imageEmpty });
      }
    })
    .catch(err => {
      if (err) {
        path && fs.unlinkSync(path);
        return res.status(500).send({ status: 500, message: userMessage.serverError });
      }
    })
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = "./uploads/avatar/" + avatarName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      return res.status(404).send({ status: 404, message: userMessage.avatarNotExist });
    } else {
      return res.sendFile(path.resolve(filePath));
    }
  });
}

function updateUser(req, res) {
  const params = req.params;
  let userData = req.body;
  userData.email = req.body.email && req.body.email.toLowerCase();
  userData.updatedAt = Date.now();

  if (userData.password) {
    bcrypt.hash(userData.password, null, null, (err, hash) => {
      if (err) {
        return res.status(500).send({ status: 500, message: userMessage.passwordEncryptFailed });
      } else {
        userData.password = hash;
      }
    });
  }

  User.findByIdAndUpdate({ _id: params.id }, userData)
    .then(userUpdate => {
      if (!userUpdate) {
        return res.status(404).send({ message: userMessage.userNotFound, status: 404 });
      } else {
        return res.status(200).send({ status: 200, message: userMessage.userUpdateSuccess, user: userData });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: userMessage.serverError });
      }
    })
}

function deleteUser(req, res) {
  const { id } = req.params;

  User.findById({ _id: id })
    .then(user => {
      if (!user) {
        return res.status(400).send({ status: 400, message: userMessage.userNotFound });
      } else {
        if (user.role === 'admin') {
          return res.status(400).send({ status: 400, message: userMessage.adminReject });
        }
        User.findByIdAndRemove(id)
          .then(userDelete => {
            if (!userDelete) {
              return res.status(404).send({ status: 404, message: userMessage.userNotFound });
            }

            let avatarPath = userDelete.avatar;
            if (avatarPath !== undefined) {
              let filePathToDelete = "./uploads/avatar/" + avatarPath;
              fs.unlinkSync(filePathToDelete);
            }
            return res.status(200).send({ status: 200, message: userMessage.deleteSuccess });
          })
          .catch(err => {
            if (err) {
              return res.status(500).send({ status: 500, message: userMessage.serverError });
            }
          });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: err });
      }
    })
}

function updateRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  User.findByIdAndUpdate(id, { role })
    .then(userStored => {
      if (!userStored) {
        return res.status(404).send({ status: 404, message: userMessage.userNotFound });
      } else {
        if (!role) {
          return res.status(404).send({ status: 404, message: userMessage.roleEmpty });
        } else {
          return res.status(200).send({ status: 200, message: userMessage.roleSuccess + role });
        }
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: userMessage.serverError });
      }
    })
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  uploadAvatar,
  getAvatar,
  updateUser,
  deleteUser,
  updateRole,
};
