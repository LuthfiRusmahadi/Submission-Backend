const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
    const server = Hapi.server({
        port: 9000,
        host: 'localhost',
    });

    const books = [];

    server.route([
        {
            method: 'POST',
            path: '/books',
            handler: (request, h) => {
                const payload = request.payload;

                if (!payload.name) {
                    return h.response({
                        status: 'fail',
                        message: 'Gagal menambahkan buku. Mohon isi nama buku',
                    }).code(400);
                }

                if (payload.readPage > payload.pageCount) {
                    return h.response({
                        status: 'fail',
                        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
                    }).code(400);
                }

                const id = nanoid();
                const insertedAt = new Date().toISOString();
                const updatedAt = insertedAt;

                const newBook = {
                    id,
                    ...payload,
                    finished: payload.pageCount === payload.readPage,
                    insertedAt,
                    updatedAt,
                };

                books.push(newBook);

                return h.response({
                    status: 'success',
                    message: 'Buku berhasil ditambahkan',
                    data: {
                        bookId: id,
                    },
                }).code(201);
            },
        },
        {
            method: 'GET',
            path: '/books',
            handler: (request, h) => {
                const filteredBooks = books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                }));

                return h.response({
                    status: 'success',
                    data: {
                        books: filteredBooks,
                    },
                }).code(200);
            },
        },
        {
            method: 'GET',
            path: '/books/{bookId}',
            handler: (request, h) => {
                const { bookId } = request.params;
                const book = books.find((b) => b.id === bookId);

                if (book) {
                    return h.response({
                        status: 'success',
                        data: {
                            book,
                        },
                    }).code(200);
                }

                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan',
                }).code(404);
            },
        },
        {
            method: 'PUT',
            path: '/books/{bookId}',
            handler: (request, h) => {
                const { bookId } = request.params;
                const { payload } = request;
                const bookIndex = books.findIndex((b) => b.id === bookId);

                if (bookIndex !== -1) {
                    if (!payload.name) {
                        return h.response({
                            status: 'fail',
                            message: 'Gagal memperbarui buku. Mohon isi nama buku',
                        }).code(400);
                    }

                    if (payload.readPage > payload.pageCount) {
                        return h.response({
                            status: 'fail',
                            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
                        }).code(400);
                    }

                    const updatedAt = new Date().toISOString();

                    books[bookIndex] = {
                        ...books[bookIndex],
                        ...payload,
                        finished: payload.pageCount === payload.readPage,
                        updatedAt,
                    };

                    return h.response({
                        status: 'success',
                        message: 'Buku berhasil diperbarui',
                    }).code(200);
                }

                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan',
                }).code(404);
            },
        },
        {
            method: 'DELETE',
            path: '/books/{bookId}',
            handler: (request, h) => {
                const { bookId } = request.params;
                const bookIndex = books.findIndex((b) => b.id === bookId);

                if (bookIndex !== -1) {
                    books.splice(bookIndex, 1);

                    return h.response({
                        status: 'success',
                        message: 'Buku berhasil dihapus',
                    }).code(200);
                }

                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan',
                }).code(404);
            },
        },
    ]);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();
