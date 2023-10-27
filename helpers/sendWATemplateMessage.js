import axios from "axios";
import { fileTypeFromBuffer } from "file-type";

export default async function sendWATemplateMessage({
  template,
  list,
  variables,
}) {
  console.log({ list, template, variables: JSON.stringify(variables) });
  return new Promise(async (resolve, reject) => {
    //upload file to whatsapp
    try {
      let mediaId = null;

      if (
        template.components.filter(
          (component) =>
            component.type === "HEADER" &&
            (component.format === "IMAGE" || component.format === "VIDEO")
        ).length > 0
      ) {
        /**
         *
         *
         * upload file to whatsapp to get media id
         */

        let apiKey = process.env.WA_API_KEY;

        // await fb
        //   .collection("wa_key")
        //   .doc(uid)
        //   .get()
        //   .then((querySnapshot) => {
        //     // console.log("SNAPSHOT :>> ", querySnapshot.data());
        //     apiKey = querySnapshot.data().apiKey;
        //   })
        //   .catch((err) => {
        //     res.status(403).json(err);
        //   });

        const fileContents = await axios.get(
          template.components.filter(
            (component) =>
              component.type === "HEADER" &&
              (component.format === "IMAGE" || component.format === "VIDEO")
          )[0].example.header_handle[0],
          {
            responseType: "arraybuffer",
          }
        );

        const buffer = Buffer.from(fileContents.data, "buffer");

        const fileTypeBuffer = await fileTypeFromBuffer(buffer);

        const mime = fileTypeBuffer.mime;

        await axios
          .post(
            "https://waba.360dialog.io/v1/media/",
            Buffer.from(buffer, "buffer"),
            {
              headers: {
                "D360-API-KEY": apiKey,
                "Content-Type": mime,
              },
            }
          )
          .then((response) => {
            mediaId = response.data.media[0].id;
          })
          .catch((error) => {
            console.log(error);
          });
      }

      let successfulResults = [];
      let failedResults = [];

      for (let j = 0; j < list.contacts.length; j++) {
        const templateComponents = (() => {
          let components = [];

          for (let i = 0; i < template.components.length; i++) {
            if (template.components[i].type === "HEADER") {
              components.push({
                type: "header",
                parameters: (() => {
                  if (
                    template.components[i].format === "TEXT" &&
                    template.components[i].text.match(/{{[1-9]}}/g)
                  ) {
                    console.log(
                      "variables.header :>> ",
                      list.contacts[j][variables.header[0].select]
                    );
                    return [
                      {
                        type: "text",
                        text:
                          variables.header[0].text &&
                          variables.header[0].text !== ""
                            ? variables.header[0].text
                            : list.contacts[j][variables.header[0]?.select],
                      },
                    ];
                  }

                  if (template.components[i].format === "IMAGE") {
                    return [
                      {
                        type: "image",
                        image: { id: mediaId },
                      },
                    ];
                  }

                  if (template.components[i].format === "VIDEO") {
                    return [
                      {
                        type: "video",
                        video: { id: mediaId },
                      },
                    ];
                  }
                })(),
              });
            }

            if (
              template.components[i].type === "BODY" &&
              template.components[i].text.match(/{{[1-9]}}/g)
            ) {
              components.push({
                type: "body",
                parameters: (() => {
                  if (template.components[i].text.match(/{{[1-9]}}/g)) {
                    return template.components[i].text
                      .match(/{{[1-9]}}/g)
                      .map((varb, index) => {
                        console.log({
                          list: list.contacts[j][variables.body[index]?.select],
                          text: variables.body[index].text,
                          variables: [variables.body[index]],
                        });
                        return {
                          type: "text",
                          text:
                            variables.body[index].text &&
                            variables.body[index].text !== ""
                              ? variables.body[index].text
                              : list.contacts[j][variables.body[index]?.select],
                        };
                      });
                  }
                })(),
              });
            }
          }

          return components;
        })();

        const templateData = templateComponents
          ? {
              namespace: template.namespace,
              language: {
                policy: "deterministic",
                code: template.language,
              },
              name: template.name,
              components: templateComponents,
            }
          : {
              namespace: template.namespace,
              language: {
                policy: "deterministic",
                code: template.language,
              },
              name: template.name,
            };

        console.log({ templateData });

        // console.log(templateData);
        try {
          let res = await axios({
            method: "post",
            url: "https://waba.360dialog.io/v1/messages",
            data: {
              to: list.contacts[j].phoneNumber,
              type: "template",
              template: templateData,
            },
            headers: {
              "D360-API-KEY": process.env.WA_API_KEY,
            },
          });
          console.log({ res });
          successfulResults.push(list.contacts[j].phoneNumber);
          console.log({ s: successfulResults });
        } catch (err) {
          console.log({ err });
          failedResults.push(list.contacts[j].phoneNumber);
        }
      }

      //send message

      // const templateData = (() => {
      //   if (template.type === "interactive") {
      //     return {
      //       namespace: template.namespace,
      //       language: {
      //         policy: "deterministic",
      //         code: template.language,
      //       },
      //       name: template.name,
      //       components: [
      //         {
      //           type: "header",
      //           parameters: (() => {
      //             if (
      //               template.header.type === "text" &&
      //               template.header.text.match(/{{1}}/)
      //             ) {
      //               return [
      //                 {
      //                   type: "text",
      //                   text: template.header.text,
      //                 },
      //               ];
      //             }

      //             if (template.header.type === "image") {
      //               return [
      //                 {
      //                   type: "image",
      //                   image: { id: template.header.mediaId },
      //                 },
      //               ];
      //             }

      //             if (template.header.type === "video") {
      //               return [
      //                 {
      //                   type: "video",
      //                   video: { id: template.header.mediaId },
      //                 },
      //               ];
      //             }

      //             if (template.header.type === "audio") {
      //               return [
      //                 {
      //                   type: "audio",
      //                   audio: { id: template.header.mediaId },
      //                 },
      //               ];
      //             }
      //           })(),
      //         },
      //       ],
      //     };
      //   } else {
      //     return {
      //       namespace: template.namespace,
      //       language: {
      //         policy: "deterministic",
      //         code: template.language,
      //       },
      //       name: template.name,
      //     };
      //   }
      // })();

      resolve({
        successfulResults,
        failedResults,
      });
    } catch (err) {
      console.log({ err });
      reject(err);
    }
  });
}
