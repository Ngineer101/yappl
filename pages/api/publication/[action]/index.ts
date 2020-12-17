import { NextApiRequest, NextApiResponse } from "next";
import { Publication, Post, Member, MailSettings, MailProviders } from "../../../../models";
import { dbConnection } from "../../../../repository";
import { getSession } from "next-auth/client";
import axios from 'axios';
import xmlParser from 'fast-xml-parser';
import url from 'url';
import crypto from 'crypto';
import mailgun from 'mailgun-js';
import { CryptoUtils } from '../../../../utils/crypto';

export default async function GenericPublicationHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { action, publicationId, postId },
    body
  } = req;

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end('Unauthorized');
    return;
  }

  const connection = await dbConnection('publication');
  const publicationRepository = connection.getRepository(Publication);

  switch (action) {
    case 'import': {
      if (method === 'POST') {
        const publication = await getPublication(body.source, body.rssFeedUrl, body.userId, session.user.name);
        if (publication) {
          const existingPublication = await publicationRepository.findOne({ name: publication.name });
          if (!existingPublication) {
            await publicationRepository.save(publication);
            res.status(200).end(publication.id);
          } else {
            res.status(400).end('A publication with this name already exists');
          }
        } else {
          res.status(400).end('Error trying to import publication');
        }
      }

      break;
    }
    case 'new': {
      if (method === 'POST') {
        const existingPublication = await publicationRepository.findOne({ name: body.name });
        if (!existingPublication) {
          const newPublication = new Publication(body.name, body.description, body.userId, body.imageUrl);
          await publicationRepository.save(newPublication);
          res.status(200).end(newPublication.id);
        } else {
          res.status(400).end('A publication with this name already exists');
        }
      }

      break;
    }
    case 'update': {
      if (method === 'POST') {
        const publication = await publicationRepository.findOne({ id: publicationId as string });
        if (publication) {
          publication.name = body.name;
          publication.description = body.description;
          publication.imageUrl = body.imageUrl
          await publicationRepository.save(publication);
          res.status(204).end('Saved publication');
        } else {
          res.status(404).end('Publication not found');
        }
      }

      break;
    }
    case 'update-mail-settings': {
      if (method === 'POST') {
        const {
          mailProvider,
          mailgunApiKey,
          mailgunDomain,
          mailgunHost,
        } = body;

        const publicationRepository = connection.getRepository(Publication);
        const mailSettingsRepository = connection.getRepository(MailSettings);
        const publication = await publicationRepository.findOneOrFail({ id: publicationId as string });

        let encryptedApiKey = '';
        if (mailgunApiKey) {
          encryptedApiKey = CryptoUtils.encryptKey(mailgunApiKey);
        }

        if (publication.mailSettingsId) {
          const mailSettings = await mailSettingsRepository.findOneOrFail({ id: publication.mailSettingsId });
          mailSettings.provider = mailProvider;
          mailSettings.mailgunApiKey = encryptedApiKey;
          mailSettings.mailgunDomain = mailgunDomain;
          mailSettings.mailgunHost = mailgunHost;
          await mailSettingsRepository.save(mailSettings);
        } else {
          let mailSettings = new MailSettings(mailProvider);
          mailSettings.mailgunApiKey = encryptedApiKey;
          mailSettings.mailgunDomain = mailgunDomain;
          mailSettings.mailgunHost = mailgunHost;
          await mailSettingsRepository.save(mailSettings);
          publication.mailSettingsId = mailSettings.id;
          await publicationRepository.save(publication);
        }

        res.status(204).end('Mail settings saved');
      }
    }
    case 'new-post': {
      if (method === 'GET') {
        const postRepository = connection.getRepository(Post);
        const randomId = crypto.randomBytes(5).toString('hex');
        const newPost = new Post(
          '',
          '',
          randomId,
          randomId,
          '',
          session.user.name,
          session.user.image,
          publicationId as string,
          false,
          'yappl',
          new Date(),
          new Date()
        );

        await postRepository.save(newPost);
        res.status(200).end(newPost.id);
      }

      break;
    }
    case 'post': {
      const postRepository = connection.getRepository(Post);
      const post = await postRepository.findOne({ id: postId as string, publicationId: publicationId as string });
      if (method === 'POST') {
        if (post) {
          post.title = body.title;
          post.subtitle = body.subTitle;
          post.htmlContent = body.htmlContent;
          await postRepository.save(post);
        }

        res.status(201).end('Saved post successfully.');
      }

      break;
    }
    case 'publish-post': {
      if (method === 'POST') {
        const postRepository = connection.getRepository(Post);
        const post = await postRepository.findOne({ id: postId as string, publicationId: publicationId as string });
        if (post && !post.isPublished) {
          // TODO: Fix bug to save post first before publishing
          const slug = getSlug(post.title, post.slug);
          post.title = body.title;
          post.subtitle = body.subTitle;
          post.htmlContent = body.htmlContent;
          post.isPublished = true;
          post.canonicalUrl = `${process.env.SITE_URL}/p/${slug}`;
          post.slug = slug;
          post.publishedAt = new Date();
          post.authorName = session.user.name;
          post.authorImage = session.user.image;
          await postRepository.save(post);

          const mailSettingsRepository = connection.getRepository(MailSettings);
          const mailSettings = await mailSettingsRepository.findOne();
          if (!mailSettings || mailSettings?.provider === MailProviders.NONE) {
            res.status(200).json(post);
            break;
          }

          const membersRepository = connection.getRepository(Member);
          const members = await membersRepository.find({ emailVerified: true, publicationId: publicationId as string });
          const emails = members.map(m => m.email);

          const publicationRepository = connection.getRepository(Publication);
          const publication = await publicationRepository.findOneOrFail({ id: publicationId as string });
          const htmlContent =
            `
            <div style="display: flex; justify-content: center;">
              <div style="max-width: 600px;">
                <div>
                  <h1>${post.title}</h1>
                  <label>${post.subtitle}</label>
                </div>
                <div style="text-align: right;">
                  <small>
                    <a href="${post.canonicalUrl}" target="_blank">View post online &#8594;</a>
                  </small>
                </div>
                <br />
            ` +
            post.htmlContent +
            `
                <hr />
                <div style="display: flex; align-items: center;">
                  <img src="${post.authorImage}" style="border-radius: 50%; height: 50px; width: 50px; margin-right: 10px;" alt="author image" />
                  <span style="margin: auto 0px;">- ${post.authorName}</span>
                </div>
                <br />
                <br />
                <div>
                  <small>
                    You received this email because you are subscribed to ${publication.name}.
                  </small>
                  <small>
                    <a href="%recipient.unsubscribe_url%" target="_blank">Click here to unsubscribe</a>
                  </small>
                </div>
              </div>
            </div>`;

          var recipientVariables: any = {};
          members.forEach(m => {
            const buff = Buffer.from(m.email)
            const encodedEmail = buff.toString('base64');

            recipientVariables[m.email] = {
              unsubscribe_url: `${process.env.SITE_URL}/member/unsubscribe?e=${encodedEmail}&token=${m.verificationToken}`
            }
          });

          const data = {
            from: `${publication.name} <${process.env.DEFAULT_EMAIL ? process.env.DEFAULT_EMAIL : `hey@${mailSettings.mailgunDomain}`}>`, // TODO: Add publication email
            to: emails.join(', '),
            subject: post.title,
            html: htmlContent,
            'recipient-variables': JSON.stringify(recipientVariables),
          }

          const mg = mailgun({ apiKey: CryptoUtils.decryptKey(mailSettings.mailgunApiKey || ''), domain: mailSettings.mailgunDomain || '', host: mailSettings.mailgunHost });
          await mg.messages().send(data, (error, response) => {
            if (error) {
              console.log(`Error publishing post: ${JSON.stringify(error)}`);
            } else {
              console.log(`Email response: ${JSON.stringify(response)}`);
            }
          });

          res.status(200).json(post)
        } else {
          res.status(400).end('An error occurred while sending the post to members')
        }
      }

      break;
    }
    default:
      console.log('Unknown API route specified');
      res.status(400).end('Unknown API route specified');
      break;
  }

  await connection.close();
}

async function getPublication(source: 'rss' | 'yappl', rssFeedUrl: string, userId: string, defaultAuthorName: string): Promise<Publication | null> {
  // TODO: Check source
  const response = await axios.get(rssFeedUrl);
  if (response.data) {
    if (xmlParser.validate(response.data) === true) {
      const body: IRssFeed = xmlParser.parse(response.data);
      const channel = body.rss.channel;
      if (channel) {
        const title = channel.title;
        const description = channel.description;

        let posts: Post[] = [];
        if (channel.item.length && channel.item.length > 0) {
          posts = channel.item.map(i => {
            const postUrl = url.parse(i.guid);
            const slug = postUrl.pathname ? postUrl.pathname.replace('/p/', '') : title.replace(' ', '-')
            return new Post(
              i.title,
              i.description,
              i.guid,
              slug,
              i["content:encoded"],
              i["dc:creator"] ? i["dc:creator"] : defaultAuthorName,
              "",
              '',
              true,
              source,
              i.pubDate,
              i.pubDate)
          });
        } else {
          const item = (channel.item as any) as IItem
          const postUrl = url.parse(item.guid);
          const slug = postUrl.pathname ? postUrl.pathname.replace('/p/', '') : title.replace(' ', '-')
          const newPost = new Post(
            item.title,
            item.description,
            item.guid,
            slug,
            item['content:encoded'],
            item["dc:creator"] ? item["dc:creator"] : defaultAuthorName,
            "",
            '',
            true,
            source,
            item.pubDate,
            item.pubDate
          );

          posts = [newPost];
        }

        let publication = new Publication(title, description, userId, channel.image ? channel.image.url : undefined);
        publication.posts = posts;
        return publication;
      }
    }
  }

  return null;
}

function getSlug(title: string, existingSlug: string): string {
  const titleWithoutSpaces = title.replace(/\s+/g, '-').replace('\'', '').replace(',', '-').replace(/[^a-zA-Z0-9-_]/g, '');
  if (existingSlug) {
    return `${titleWithoutSpaces}-${existingSlug}`;
  } else {
    const randomId = crypto.randomBytes(8).toString('hex');
    return `${titleWithoutSpaces}-${randomId}`;
  }
}

interface IRssFeed {
  rss: {
    channel: {
      title: string,
      description: string,
      link: string,
      image: {
        url: string,
        title: string,
        link: string,
      },
      generator: string,
      author: string,
      item: IItem[]
    }
  }
}

interface IItem {
  title: string,
  description: string,
  link: string,
  guid: string,
  'dc:creator': string,
  pubDate: Date,
  enclosure: string,
  'content:encoded': string
}
