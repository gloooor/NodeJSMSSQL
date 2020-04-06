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

const connectionPool = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected");
    return pool;
  })
  .catch((err) => console.log("Connection Failed: ", err));

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
  }
};
const splitUrl = (str) => {
  mas = str.split("/");
  return mas;
};

const getDB = (table) => {
  return connectionPool.then((pool) => {
    return pool.query(`select * from ${table}`);
  });
};

const setDB = (table, body) => {
  return connectionPool.then((pool) => {
    let str = "";
    const req = pool.request();
    for (el in body) {
      let elType = Number.isInteger(body[el]) ? sql.Int : sql.NVarChar;
      req.input(el, elType, body[el]);
      str += `@${el},`;
    }
    console.log(`inserted`);
    return req.query(`insert into ${table} values ( ${str.slice(0, -1)})`);
  });
};

const updateDB = (table, body) => {
  return connectionPool.then((pool) => {
    let str = "";
    let condition = "";
    let isStr;
    const req = pool.request();
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
    return req.query(
      `update ${table} set  ${str.slice(0, -1)} where ${table}=${condition}`
    );
  });
};
const deleteDB = (table, id, some) => {
  return connectionPool.then((pool) => {
    some = some ? some : table;
    const req = pool.request();
    id = decodeURI(id);
    return req.query(`delete ${table} where ${some} = '${id}'`);
  });
};

const server = http.createServer((req, res) => {
  const url = splitUrl(parser.parse(req.url, true).pathname);
  let body = [];
  req.on("data", (data) => {
    body.push(data.toString());
  });

  switch (req.method) {
    case "GET":
      getReq(res, url);
      break;
    case "POST":
      postReq(req, res, url, body);
      break;
    case "PUT":
      putReq(req, res, url, body);
      break;
    case "DELETE":
      deleteReq(req, res, url, body);
      break;
    default:
      error(1, res);
  }
});
const getReq = (res, url) => {
  if (!url[1]) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(__dirname + "\\index.html"));
  } else if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        getDB("FACULTY").then((records) => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(records.recordset));
        });
        break;
      case "pulpits":
        getDB("PULPIT").then((records) => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(records.recordset));
        });
        break;
      case "subjects":
        getDB("SUBJECT").then((records) => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(records.recordset));
        });
        break;
      case "auditoriumstypes":
        getDB("AUDITORIUM_TYPE").then((records) => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(records.recordset));
        });
        break;
      case "auditoriums":
        getDB("AUDITORIUM").then((records) => {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(records.recordset));
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

const postReq = (req, res, url, body) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("FACULTY", body);
          message(1, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("PULPIT", body);
          message(1, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("SUBJECT", body);
          message(1, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("AUDITORIUM_TYPE", body);
          message(1, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          body = JSON.parse(body);
          setDB("AUDITORIUM", body);
          message(1, res);
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
const putReq = (req, res, url, body) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("FACULTY", body);
          message(3, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("PULPIT", body);
          message(3, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("SUBJECT", body);
          message(3, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("AUDITORIUM_TYPE", body);
          message(3, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          body = JSON.parse(body);
          updateDB("AUDITORIUM", body);
          message(3, res);
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
const deleteReq = (req, res, url, body) => {
  if (url[1] === "api") {
    switch (url[2]) {
      case "faculties":
        req.on("end", () => {
          deleteDB("FACULTY", url[3]);
          message(2, res);
        });
        break;
      case "pulpits":
        req.on("end", () => {
          deleteDB("PULPIT", url[3]);
          message(2, res);
        });
        break;
      case "subjects":
        req.on("end", () => {
          deleteDB("SUBJECT", url[3], "SUBJECTS");
          message(2, res);
        });
        break;

      case "auditoriumstypes":
        req.on("end", () => {
          deleteDB("AUDITORIUM_TYPE", url[3]);
          message(2, res);
        });
        break;

      case "auditoriums":
        req.on("end", () => {
          deleteDB("AUDITORIUM", url[3]);
          message(2, res);
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

server.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
server.on("error", (e) => {
  console.log(`${e.code} on http://localhost:${port}`);
});
