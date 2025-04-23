const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  context.log('⚡️ SaveDataHttpTrigger start', req.body);
  try {
    const { name, task } = req.body;
    if (!name || !task) {
      context.log.warn('Не вистачає name/task');
      context.res = { status: 400, body: "Name і task обов’язкові" };
      return;
    }

    const connStr = process.env.AzureWebJobsStorage;
    context.log('Connection string отримано, створюємо клієнт BlobService');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
    const containerClient = blobServiceClient.getContainerClient("data");
    await containerClient.createIfNotExists();
    context.log('Контейнер data готовий');

    const timestamp = Date.now();
    const fileName = `${timestamp}_${name}.json`;
    const content = JSON.stringify({ name, task });
    context.log(`Завантажуємо файл ${fileName}`);
    await containerClient
      .getBlockBlobClient(fileName)
      .uploadData(Buffer.from(content));

    context.log('✅ Успіх, файл завантажено');
    context.res = { status: 200, body: { message: `Uploaded as ${fileName}` } };
  } catch (err) {
    context.log.error('🔥 Помилка в SaveDataHttpTrigger:', err);
    context.res = { status: 500, body: "Internal Server Error" };
  }
};