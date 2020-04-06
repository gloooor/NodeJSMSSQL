const http = require("http");
const parser = require("url");
const sql = require("mssql");
const fs = require("fs");
const port = 3000;

const config = {
  user: "sa",
  password: "03042001loi",
  server: "LAPTOP-C56MS0DD",
  Database: "LGP",
  pool: {
    max: 15,
    min: 0,
    softIdleTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  },
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

const message = (num, res) => {
  res.writeHead(404, {
    "Content-type": "application/json; charset=utf-8",
  });
  switch (num) {
    case 1:
      res.end(
        JSON.stringify({
          num: 1,
          message: `Данные успешно добавлены`,
        })
      );
      break;
    case 2:
      res.end(
        JSON.stringify({
          num: 2,
          message: `Данные успешно удалены`,
        })
      );
      break;
    case 3:
      res.end(
        JSON.stringify({
          num: 3,
          message: `Данные успешно изменены`,
        })
      );
      break;
  }
};

const error = (num, res) => {
  res.writeHead(404, {
    "Content-type": "application/json; charset=utf-8",
  });
  switch (num) {
    case 1:
      res.end(
        JSON.stringify({
          error: 1,
          message: `Данный метод не поддерживается`,
        })
      );
      break;
    case 2:
      res.end(
        JSON.stringify({
          error: 2,
          message: `Данный url не поддерживается`,
        })
      );
      break;
    case 3:
      res.end(
        JSON.stringify({
          error: 3,
          message: `Ошибка в операции с БД`,
        })
      );
      break;
  }
};
const splitUrl = (str) => {
  mas = str.split("/");
  return mas;
};

const getDB = (table, pool, res) => {
  pool.request().query(`select * from ${table}`, (err, result) => {
    if (err) error(3, res);
    else {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result.recordset));
    }
  });
};

const setDB = (table, body, pool, res) => {
  let str = "";
  const req = pool.request();
  for (el in body) {
    let elType = Number.isInteger(body[el]) ? sql.Int : sql.NVarChar;
    req.input(el, elType, body[el]);
    str += `@${el},`;
  }
  req.query(
    `insert into ${table} values ( ${str.slice(0, -1)})`,
    (err, result) => {
      if (err) error(3, res);
      else {
        message(1, res);
      }
    }
  );
};

const updateDB = (table, body, pool, res) => {
  let str = "";
  let condition = "";
  let isStr;
  for (el in body) {
    isStr = Number.isInteger(body[el]) ? false : true;
    if (table !== el) {
      if (isStr) str += `${el} = '${body[el]}',`;
      else str += `${el} = ${body[el]}, `;
    } else {
      if (isStr) condition = `'${body[el]}'`;
      else condition = body[el];
    }
  }
  pool
    .request()
    .query(
      `update ${table} set  ${str.slice(0, -1)} where ${table}=${condition}`,
      (err, result) => {
        if (err) error(3, res);
        else {
          message(3, res);
        }
      }
    );
};
const deleteDB = (table, id, pool, res) => {
  id = decodeURI(id);
  pool
    .request()
    .query(`delete ${table} where ${table} = '${id}'`, (err, result) => {
      if (err) error(3, res);
      else {
        message(2, res);
      }
    });
};

const getReq = (req, res, url, body, pool) => {
  if (!url[1]) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(__dirname + "\\index.html"));
  } else if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        getDB("FACULTY", pool, res);
        break;
      case "pulpits":
        getDB("PULPIT", pool, res);
        break;
      case "subjects":
        getDB("SUBJECT", pool, res);
        break;
      case "auditoriumstypes":
        getDB("AUDITORIUM_TYPE", pool, res);
        break;
      case "auditoriums":
        getDB("AUDITORIUM", pool, res);
        break;
      default:
        error(2, res);
        break;
    }
  } else {
    error(2, res);
  }
};

const postReq = (req, res, url, body, pool) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("FACULTY", body, pool, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("PULPIT", body, pool, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("SUBJECT", body, pool, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("AUDITORIUM_TYPE", body, pool, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("AUDITORIUM", body, pool, res);
        });
        break;

      default:
        error(2, res);
        break;
    }
  } else {
    error(2, res);
  }
};
const putReq = (req, res, url, body, pool) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("FACULTY", body, pool, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("PULPIT", body, pool, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("SUBJECT", body, pool, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("AUDITORIUM_TYPE", body, pool, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("AUDITORIUM", body, pool, res);
        });
        break;

      default:
        error(2, res);
        break;
    }
  } else {
    error(2, res);
  }
};
const deleteReq = (req, res, url, body, pool) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          deleteDB("FACULTY", url[3], pool, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          deleteDB("PULPIT", url[3], pool, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          deleteDB("SUBJECT", url[3], pool, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          deleteDB("AUDITORIUM_TYPE", url[3], pool, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          deleteDB("AUDITORIUM", url[3], pool, res);
        });
        break;

      default:
        error(2, res);
        break;
    }
  } else {
    error(2, res);
  }
};

const handler = (req, res) => {
  const pool = new sql.ConnectionPool(config, (err) => {
    if (err) console.log("Error of connecting with DB:", err.code);
    else {
      const url = splitUrl(parser.parse(req.url, true).pathname);
      let body = [];
      req.on("data", (data) => {
        body.push(data.toString());
      });
      switch (req.method) {
        case "GET":
          getReq(req, res, url, body, pool);
          break;
        case "POST":
          postReq(req, res, url, body, pool);
          break;
        case "PUT":
          putReq(req, res, url, body, pool);
          break;
        case "DELETE":
          deleteReq(req, res, url, body, pool);
          break;
        default:
          error(1, res);
      }
    }
  });
};
const server = http.createServer();
server.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
server.on("error", (e) => {
  console.log(`${e.code} on http://localhost:${port}`);
});
server.on("request", handler);
