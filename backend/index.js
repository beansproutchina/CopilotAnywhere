import koa from 'koa';
import koaRouter from 'koa-router';
import { OpenAI } from 'openai/client.js';
import cors from 'koa2-cors';
import koaBody from 'koa-body-esm';

const start = async () => {
    const app = new koa();
    const router = new koaRouter();
    app.use(koaBody({
        multipart: false,
    }));

    // 添加CORS中间件
    app.use(cors({
        origin: '*', // 允许所有来源
    }));

    const openai = new OpenAI({
        baseURL: process.env.OPENAI_API_BASE_URL,
        apiKey: process.env.OPENAI_API_KEY,
    });
    router.post('/chat', async (ctx) => {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: 'system', content: '你是一个智能助手。' },
                { role: 'user', content: ctx.request.body.message }
            ]
        });
        ctx.body = response.choices[0].message.content;
    });

    router.post(`/implement`, async (ctx) => {
        const filename = ctx.request.body.filename || 'example.txt';
        const programmingLang = ctx.request.body.language || 'python';
        const content = ctx.request.body.content || 'This is an example content.<FillHere>';
        let prompt;
        switch (programmingLang.toLowerCase()) {
            case '水源社区':
                prompt = `水源社区是上海交大内部论坛，你正在编辑帖子，帖子标题为[${filename}]，请在<FillHere>中插入内容，以友善为原则，在保持前文语气和延续前文内容的基础上，完成帖子正文`;
                break;
            case 'ai':
                prompt = `你正在向一个AI助手提问，当前使用的AI及主题是[${filename}], 请在<FillHere>中插入内容，以使得提问更加完整。`
                break;
            case 'markdown':
            case 'latex':
                prompt = `你是一个擅长写文章、论文的研究生，你正在使用${programmingLang}编辑文件名为[${filename}]的文件，请在<FillHere>中插入内容，以严谨科学的态度补全当前文章。`;
                break;
            default:
                prompt = `你是一个擅长${programmingLang}的专家。你正在编辑文件名为[${filename}]的文件，请在<FillHere>中插入内容，以补全当前实现。请确保正确无误，符合${programmingLang}的语法规则和最佳实践，并包含必要的注释。`;
        }
        const restrictionsPrompt = `只能返回<FillHere>中插入的内容，插入的内容以100字以内为宜。
严禁返回以下内容：
1. 思考过程
2. 语气词
3. 标签前后的原始内容
4. 任何其他内容
5. 添加形如\`\`\`${programmingLang}\`\`\`的前后缀
6. 原始prompt内容`

        const response = await openai.chat.completions.create({
            model: 'deepseek',
            messages: [
                { role: 'system', content: prompt },
                { role: 'system', content: restrictionsPrompt },
                { role: 'user', content: content }
            ]
        });
        ctx.body = response.choices[0].message.content;
        console.log('Implement generated for', filename);
    });

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(54259);
    console.log('Server started on http://localhost:54259');
};

start();