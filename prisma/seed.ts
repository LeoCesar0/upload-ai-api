import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.prompt.deleteMany();

  await prisma.prompt.create({
    data: {
      title: "Título YouTube",
      template: `Seu papel é gerar três títulos para um vídeo do YouTube.

Abaixo você receberá uma transcrição desse vídeo, use essa transcrição para gerar os títulos.
Abaixo você também receberá uma lista de títulos, use essa lista como referência para os títulos a serem gerados.

Os títulos devem ter no máximo 60 caracteres.
Os títulos devem ser chamativos e atrativos para maximizar os cliques.

Retorne APENAS os três títulos em formato de lista como no exemplo abaixo:
'''
- Título 1
- Título 2
- Título 3
'''

Transcrição:
'''
{transcription}
'''`.trim(),
    },
  });

  await prisma.prompt.create({
    data: {
      title: "Descrição YouTube",
      template:
        `Seu papel é gerar uma descrição sucinta para um vídeo do YouTube.
  
Abaixo você receberá uma transcrição desse vídeo, use essa transcrição para gerar a descrição.

A descrição deve possuir no máximo 80 palavras em primeira pessoa contendo os pontos principais do vídeo.

Use palavras chamativas e que cativam a atenção de quem está lendo.

Além disso, no final da descrição inclua uma lista de 3 até 10 hashtags em letra minúscula contendo palavras-chave do vídeo.

O retorno deve seguir o seguinte formato:
'''
Descrição.

#hashtag1 #hashtag2 #hashtag3 ...
'''

Transcrição:
'''
{transcription}
'''`.trim(),
    },
  });

  await prisma.prompt.create({
    data: {
      title: "Letra de Música (transcrição)",
      template: `Seu papel é gerar uma letra de música.

Abaixo você receberá uma transcrição em áudio de um vídeo, use os temas abordados nessa transcrição para gerar a letra de uma música.

Utilize palavras usadas na transcrição.
A letra deve ter no máximo 300 caracteres.
A letra deve ser chamativa e atrativa.
A letra deve estar na lingua portuguesa.
A letra deve seguir a estrutura: Verso 1, Verso 2, Refrão, Verso 1, Verso 3, Refrão, Verso 1, Verso 4, Refrão, Refrão alterado.
A letra deve contar uma história com progresso e conclusão.

Tome como referência a letra canções abaixo:
'''
Opeth - Leper Affinity
Opeth - April Ethereal
'''

Retorne apenas a letra separada por linhas com indicações da estrutura da letra como no exemplo abaixo:
'''
- Verso 1
Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson

- Verso 2
Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson

- Refrão
Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson Lorem ipson

ETC...
'''

Transcrição:
'''
{transcription}
'''`.trim(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
